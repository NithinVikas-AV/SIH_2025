import datetime
import logging
import ollama
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("mcp_remote_server")

import subprocess

def stop_ollama_model(model_name):
    """
    Stops a specific Ollama model.

    Args:
        model_name (str): The name of the Ollama model to stop.
    """
    try:
        command = ["ollama", "stop", model_name]
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        print(f"Successfully stopped model: {model_name}")
    except subprocess.CalledProcessError as e:
        print(f"Error stopping model {model_name}: {e}")
    except FileNotFoundError:
        print("Error: 'ollama' command not found. Ensure Ollama is installed and in your PATH.")

@mcp.tool()
async def get_medical_response(query: str) -> str:
    """Provide mental health support or guidance based on user queries."""
    try:
        client = ollama.AsyncClient(timeout=180)
        result = await client.generate(
            model="ALIENTELLIGENCE/mindwell",
            prompt=query
        )
        stop_ollama_model('ALIENTELLIGENCE/mindwell')
        return result.get("response", "No response from model.")
    except Exception as e:
        return f"Error while generating response: {str(e)}"

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logging.info("Starting the MCP Excel Server")
    mcp.run(transport="stdio")