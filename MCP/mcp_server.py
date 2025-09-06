import datetime
import logging
import ollama
import subprocess
import os
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

load_dotenv()
MEDICAL_BOT = os.getenv("MEDICAL_BOT")

mcp = FastMCP("mcp_remote_server")

def stop_ollama_model(model_name):

    try:
        command = ["ollama", "stop", model_name]
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        print(f"Successfully stopped model: {model_name}")

    except subprocess.CalledProcessError as e:
        print(f"Error stopping model {model_name}: {e}")
    
    except FileNotFoundError:
        print("Error: 'ollama' command not found. Ensure Ollama is installed and in your PATH.")

@mcp.tool(description="Provide mental health support or guidance based on user queries.")
async def get_medical_response(query: str) -> str:

    try:
        client = ollama.AsyncClient(timeout=180)
        result = await client.generate(
            model=MEDICAL_BOT,
            prompt=query
        )
        stop_ollama_model(MEDICAL_BOT)
        return result.get("response", "No response from model.")
    
    except Exception as e:
        return f"Error while generating response: {str(e)}"

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logging.info("Starting the MCP Excel Server")
    mcp.run(transport="stdio")