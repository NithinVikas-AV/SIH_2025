# --- Add these imports at top of client file ---
import uuid, json, time, datetime, os
from langchain_core.callbacks.base import BaseCallbackHandler
from typing import Any, Dict

# --- Audit logger (client-only) ---
class AuditLogger(BaseCallbackHandler):
    def __init__(self, log_dir: str = "logs", session_id: str | None = None):
        self.log_dir = log_dir
        os.makedirs(self.log_dir, exist_ok=True)
        self.session_id = session_id or str(uuid.uuid4())
        self._reset_turn()

    def _reset_turn(self):
        self.current: Dict[str, Any] = {}
        self._t0 = None
        self._pending_tool_runs: Dict[str, Dict[str, Any]] = {}
        self._tool_run_order: list[str] = []
        self._model_calls: list[Dict[str, Any]] = []

    # Call at the start of each user turn
    def start_interaction(self, raw_input: str, preprocessed_input: str, model_name: str):
        self._reset_turn()
        self._t0 = time.time()
        self.current = {
            "interaction_id": str(uuid.uuid4()),
            "session_id": self.session_id,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "model": model_name,
            "raw_user_input": raw_input,
            "preprocessed_input": preprocessed_input,
            "tools_called": [],
            "final_answer": None,
            "latency_ms": None,
        }

    # ---- Callback hooks to capture timings and IO ----
    def on_tool_start(self, serialized: Dict, inputs: Dict, *, run_id, parent_run_id=None, **kwargs):
        # serialized typically includes {"name": "<tool_name>"} for Tool objects
        name = serialized.get("name") or serialized.get("id") or "tool"
        t = time.time()
        rec = {
            "run_id": str(run_id),
            "name": name,
            "inputs": inputs,
            "start_time_epoch": t,
        }
        self._pending_tool_runs[rec["run_id"]] = rec
        self._tool_run_order.append(rec["run_id"])

    def on_tool_end(self, output: Any, *, run_id, **kwargs):
        t = time.time()
        rid = str(run_id)
        if rid in self._pending_tool_runs:
            rec = self._pending_tool_runs.pop(rid)
            rec["end_time_epoch"] = t
            rec["duration_ms"] = int((t - rec["start_time_epoch"]) * 1000)
            # Store a short preview to keep logs compact
            rec["output_preview"] = (output if isinstance(output, str) else str(output))[:2000]
            self.current.setdefault("tools", []).append(rec)

    def on_chat_model_start(self, serialized: Dict, messages, *, run_id, **kwargs):
        # Keep a trace of prompts used for defensible audits
        self._model_calls.append({
            "event": "chat_model_start",
            "run_id": str(run_id),
            "model_name": serialized.get("kwargs", {}).get("model_name") or serialized.get("name"),
            "messages": [m.dict() if hasattr(m, "dict") else getattr(m, "__dict__", str(m)) for m in messages],
        })

    def on_chat_model_end(self, response, *, run_id, **kwargs):
        try:
            outs = [gen.message.dict() for gen in response.generations]
        except Exception:
            outs = str(response)
        self._model_calls.append({
            "event": "chat_model_end",
            "run_id": str(run_id),
            "outputs": outs,
        })

    # ---- Finalize and persist after agent returns ----
    def finalize_and_write(self, agent_state: Dict[str, Any]):
        t1 = time.time()
        self.current["latency_ms"] = int((t1 - self._t0) * 1000)

        messages = agent_state.get("messages", [])
        tool_records = []

        # 1) Extract tool_calls and a brief rationale from assistant messages
        for msg in messages:
            cls = msg.__class__.__name__.lower()
            # AIMessage with function/tool calls
            if "aimessage" in cls:
                tool_calls = getattr(msg, "tool_calls", []) or []
                if tool_calls:
                    rationale = getattr(msg, "content", None)
                    for tc in tool_calls:
                        tool_records.append({
                            "tool_call_id": tc.get("id"),
                            "name": tc.get("name"),
                            "arguments": tc.get("args") or tc.get("arguments"),
                            # Keep a concise rationale excerpt if present
                            "rationale_excerpt": (rationale[:500] if isinstance(rationale, str) else None),
                        })
            # ToolMessage with outputs (maps back via tool_call_id)
            if "toolmessage" in cls:
                tool_call_id = getattr(msg, "tool_call_id", None)
                for rec in tool_records:
                    if rec.get("tool_call_id") == tool_call_id:
                        rec["tool_output"] = getattr(msg, "content", None)

        # 2) Merge timing info from callbacks by order (best-effort alignment)
        timed = self.current.get("tools", [])
        for i, rec in enumerate(tool_records):
            if i < len(timed):
                t = timed[i]
                rec.update({
                    "start_time": datetime.datetime.fromtimestamp(t["start_time_epoch"], datetime.timezone.utc).isoformat(),
                    "end_time": datetime.datetime.fromtimestamp(t["end_time_epoch"], datetime.timezone.utc).isoformat(),
                    "duration_ms": t["duration_ms"],
                    "output_preview": t.get("output_preview"),
                })

        self.current["tools_called"] = tool_records
        self.current.pop("tools", None)  # remove internal timing-only list
        self.current["model_calls"] = self._model_calls

        # Final answer for this turn
        if messages:
            last = messages[-1]
            self.current["final_answer"] = getattr(last, "content", str(last))

        # Persist JSONL
        log_path = os.path.join(self.log_dir, f"audit_{datetime.date.today().isoformat()}.jsonl")
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(self.current, ensure_ascii=False) + "\n")

        return self.current