import datetime
import logging
import ollama
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("mcp-excel-server")

@mcp.tool()
def get_datetime() -> str:
    """Get today's date in UTC."""
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

@mcp.tool()
async def get_medical_response(query: str) -> str:
    """Provide mental health support or guidance based on user queries."""
    try:
        client = ollama.AsyncClient(timeout=180)
        result = await client.generate(
            model="ALIENTELLIGENCE/mindwell",
            prompt=query
        )
        return result.get("response", "No response from model.")
    except Exception as e:
        return f"Error while generating response: {str(e)}"

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logging.info("Starting the MCP Excel Server")
    mcp.run(transport="stdio")