#!/usr/bin/env python3
"""
Run this as: python mcp_server.py
This starts the MCP server that exposes tools (get_medical_response, counsellor_referral, etc).
"""

import logging
import os
import subprocess
from dotenv import load_dotenv

# Optional: import ollama only when needed (so server can start even if ollama not installed)
try:
    import ollama
except Exception:
    ollama = None

from mcp.server.fastmcp import FastMCP  # ensure this package is installed / importable

load_dotenv()

DB_URL = os.getenv("DB_URL")
MEDICAL_BOT = os.getenv("MEDICAL_BOT")

if not MEDICAL_BOT:
    logging.warning("MEDICAL_BOT not set in environment. Set MEDICAL_BOT to the Ollama model name.")

mcp = FastMCP("mcp_server")


def stop_ollama_model(model_name: str) -> None:
    """Try to stop an Ollama model (best-effort)."""
    if not model_name:
        logging.debug("No model name provided to stop_ollama_model.")
        return

    try:
        command = ["ollama", "stop", model_name]
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        logging.info(f"Successfully stopped model: {model_name}")
        logging.debug(result.stdout)
    except subprocess.CalledProcessError as e:
        logging.warning(f"Error stopping model {model_name}: {e}. stderr: {e.stderr}")
    except FileNotFoundError:
        logging.warning("Error: 'ollama' CLI not found. Ensure Ollama is installed and on PATH.")


@mcp.tool(description="Provide mental health support or guidance based on user queries.")
async def get_medical_response(query: str) -> str:
    """Call Ollama async client to generate a response. Return a string."""
    if not query:
        return "Empty query provided."

    if ollama is None:
        return "Ollama client library not installed. Install the 'ollama' python package to enable this tool."

    try:
        client = ollama.AsyncClient(timeout=180)

        # Many libs return different shapes. Try to be robust:
        result = await client.generate(model=MEDICAL_BOT, prompt=query)

        # Handle common shapes:
        #  - dict with "response"
        #  - dict with "text"
        #  - object with .text attribute
        #  - dict with 'choices' list containing {'message': {'content': ...}}
        if isinstance(result, dict):
            if "response" in result:
                text = result["response"]
            elif "text" in result:
                text = result["text"]
            elif "choices" in result and isinstance(result["choices"], list) and result["choices"]:
                # try a few nested patterns
                first = result["choices"][0]
                text = (
                    first.get("text")
                    or (first.get("message") or {}).get("content")
                    or str(first)
                )
            else:
                text = str(result)
        else:
            # fallback: object with attribute .text or .response
            text = getattr(result, "text", None) or getattr(result, "response", None) or str(result)

        # Attempt to stop the model (best-effort)
        try:
            stop_ollama_model(MEDICAL_BOT)
        except Exception:
            logging.debug("stop_ollama_model failed silently.")

        return text or "No text returned by model."

    except Exception as e:
        logging.exception("Exception in get_medical_response")
        return f"Error while generating response: {str(e)}"


@mcp.tool(description="Refer counsellors availability if the user's mental condition is moderate.")
def counsellor_referral() -> str:
    # Placeholder. Re-enable DB logic when DB_URL available.
    return "Dr. Nithin Vikas is Available."


@mcp.tool(description="Suggest resource like videos based on User's Emotions.")
def suggest_resource(search_bar: str) -> str:
    return "Suggested resources are available in the resource hub."


@mcp.tool(description="Alert all counsellors if the user's mental condition is severe.")
def crisis_alert(reason: str) -> str:
    # Placeholder. Re-enable DB logic when DB_URL available.
    return "Counsellor Notified."


@mcp.tool(description="Notify admin about misuse of the application.")
def flag_misuse_alert(reason: str) -> str:
    return "User reported successfully."


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logging.info("Starting the MCP Server on localhost:8765 (SSE transport)")
    # check FastMCP signature in your environment if different
    mcp.run(transport="sse")
