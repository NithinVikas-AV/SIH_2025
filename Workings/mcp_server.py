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
    
    return """Dr. Nithin Vikas is Available."""

    # conn = psycopg2.connect(DB_URL, sslmode="require")
    # cur = conn.cursor()

    # query = """
    #     SELECT id, name, current_availability
    #     FROM counselor_profiles;
    # """

    # cur.execute(query)
    # rows = cur.fetchall()

    # counsellor_details = ""
    # counsellor_details_format = "ID: {id}, Name: {name}, Availability: {availability}"

    # for row in rows:
    #     counsellor_details += counsellor_details_format.format(id = row[0], name = row[1], availability = row[2])

    # cur.close()
    # conn.close()

    # return counsellor_details

@mcp.tool(description="Suggest resource like videos based on User's Emotions.")
def suggest_resource(search_bar: str) -> str:

    return "Suggested Resources, It is available in resource hub."

@mcp.tool(description="Alert all counsellors if the user's mental condition is severe.")
def crisis_alert(reason: str) -> str:
    
    return "Counsellor Notified."

    # try:
    #     conn = psycopg2.connect(DB_URL, sslmode="require")
    #     cur = conn.cursor()

    #     query = f"""
    #         INSERT INTO crisis_alerts (alert_type, severity_level, description, status, created_at)
    #         VALUES ('ai_detected', 8, '{reason}', 'active', CURRENT_TIMESTAMP)
    #     """

    #     cur.execute(query)

    #     conn.commit()

    #     cur.close()
    #     conn.close()
        
    #     return "Counsellor Alerted Successful" 
    
    # except Exception as e:
    #     print("Error:", e)

@mcp.tool(description="Notify admin about Miuse of the application.")
def flag_misuse_alert(reason: str) -> str:
    
    return "User reported successfully."

    # try:
    #     conn = psycopg2.connect(DB_URL, sslmode="require")
    #     cur = conn.cursor()

    #     query = f"""
    #         INSERT INTO misuse_flag (id, user_id, report_type, report_reason) 
    #         VALUES (uuid_generate_v4(), uuid_generate_v4(), 'ai_detected', '{reason}')
    #     """

    #     cur.execute(query)

    #     conn.commit()

    #     cur.close()
    #     conn.close()
        
    #     return "Misuse Flag Update Successful" 
    
    # except Exception as e:
    #     print("Error:", e)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logging.info("Starting the MCP Server")
    mcp.run(transport="stdio")