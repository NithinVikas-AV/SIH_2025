import datetime
import logging
import ollama
import subprocess
import psycopg2
import os
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

load_dotenv()
DB_URL = os.getenv("DB_URL")
MEDICAL_BOT = os.getenv("MEDICAL_BOT")

mcp = FastMCP("mcp_server")

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
    # return "Medical Response Called."
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

@mcp.tool(description="Refer counsellors availablity if the user's mental condition is moderate.")
def counsellor_referral():
    
    conn = psycopg2.connect(DB_URL, sslmode="require")
    cur = conn.cursor()

    query = """
    SELECT id, name, current_availability
    FROM counselor_profiles;
    """
    cur.execute(query)
    rows = cur.fetchall()

    counsellor_details = ""
    counsellor_details_format = "ID: {id}, Name: {name}, Availability: {availability}"

    for row in rows:
        counsellor_details += counsellor_details_format.format(id = row[0], name = row[1], availability = row[2])

    cur.close()
    conn.close()

    return counsellor_details

@mcp.tool(description="Suggest resource like videos based on User's Emotions.")
def suggest_resource(search_bar: str) -> str:
    """
        Tool to Suggest resource.
    """
    return "Suggested Resources Called."


@mcp.tool(description="Alert available counsellors if the user's mental condition is severe.")
def crisis_alert():
    """
        Uses the anonymous id of the user to fetch his real data to send it to the counsellor in case of emergency.
        Tool to Alert the available counsellor for emergency situation.
    """
    return "Crisis Alert called."

@mcp.tool(description="Notify admin about Miuse of the application.")
def flag_misuse_alert():
    """
        Tool to Notify the admin about misuse of application.
    """
    return "flag misuse alert called."


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logging.info("Starting the MCP Server")
    mcp.run(transport="stdio")