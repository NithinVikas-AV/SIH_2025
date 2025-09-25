#!/usr/bin/env python3
"""
Run this as: python mcp_client.py
This script connects to the MCP server, loads tools, and runs the React agent loop.
"""

import asyncio
import os
import uuid
from dotenv import load_dotenv
import logging

load_dotenv()

# Required packages: langchain_mcp_adapters, langgraph, langchain_google_genai
try:
    from langchain_mcp_adapters.client import MultiServerMCPClient
    from langchain_mcp_adapters.tools import load_mcp_tools
    from langgraph.prebuilt import create_react_agent
    from langgraph.checkpoint.memory import InMemorySaver
    from langchain_google_genai import ChatGoogleGenerativeAI
except Exception as e:
    logging.error("Missing some required packages. Install the needed libs: langchain_mcp_adapters, langgraph, langchain_google_genai")
    raise

# Optional audit / privacy modules (if missing, agent will still run unless they are strictly required)
try:
    from privacy_gateway import *
except Exception:
    logging.warning("privacy_gateway import failed or not present — continuing without it.")

try:
    from Audit_codes import AuditLogger
except Exception:
    # simple stub if not present
    class AuditLogger:
        def __init__(self, log_dir="logs", session_id=None):
            self.log_dir = log_dir
            self.session_id = session_id

        def __call__(self, *args, **kwargs):
            return None

        def finalize_and_write(self, *args, **kwargs):
            return None

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("GEMINI_MODEL_NAME")
TEMPERATURE_FOR_GEMINI = float(os.getenv("TEMPERATURE_FOR_GEMINI") or 0.0)
SESSION_ID = os.getenv("SESSION_ID") or str(uuid.uuid4())

if not GEMINI_API_KEY:
    logging.warning("GEMINI_API_KEY is not set. The agent LLM may not work without this key.")


async def main():
    client = MultiServerMCPClient({
        "Medical_Emergency": {
            "transport": "sse",
            "url": "http://127.0.0.1:8000/sse"   # full URL instead of host/port
        }
    })


    logging.info("Connecting to MCP server and loading tools...")
    tools = await client.get_tools()
    logging.info(f"Loaded tools: {[tool.name for tool in tools]}")

    llm = ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=GEMINI_API_KEY,
        temperature=TEMPERATURE_FOR_GEMINI
    )

    system_prompt = """
    You are the routing LLM (Gemini). Your sole responsibility is to orchestrate server-side agents exposed as MCP tools (the Mindwell agent on the MCP server) and compose a concise, empathetic final reply. Do not invent facts; do not answer directly without using tools.

    Follow the MCP tool calling policy in your codebase.
    """

    checkpointer = InMemorySaver()

    agent = create_react_agent(
        model=llm,
        tools=tools,
        checkpointer=checkpointer,
        prompt=system_prompt
    )

    audit = AuditLogger(log_dir="logs", session_id=SESSION_ID)

    print("Type your query (or 'exit' to quit):")
    while True:
        raw_input_text = input("> ")
        if raw_input_text.strip().lower() == "exit":
            break

        try:
            response = await agent.ainvoke(
                {"messages": [{"role": "user", "content": raw_input_text}]},
                config={"callbacks": [audit], "configurable": {"thread_id": SESSION_ID}}
            )
            # Response shape depends on agent implementation. Try to extract message safely:
            messages = response.get("messages") if isinstance(response, dict) else None
            if messages and len(messages) > 0:
                final = messages[-1].content
            else:
                final = getattr(response, "content", None) or str(response)

            print("\n\nResponse:\n" + final + "\n\n")
        except Exception as e:
            logging.exception("Agent invocation failed")
            print("Error during agent invocation:", e)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
