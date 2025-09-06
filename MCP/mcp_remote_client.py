import asyncio
import sys
from typing import Optional
from contextlib import AsyncExitStack

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

class MCPGeminiClient:
    def __init__(self):
        self.session: Optional[ClientSession] = None
        self.exit_stack = AsyncExitStack()
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    async def connect_to_server(self, server_script_path: str):
        """Connect to an MCP server."""
        if not server_script_path.endswith(".py"):
            raise ValueError("Server script must be a .py file")

        server_params = StdioServerParameters(
            command="python",
            args=[server_script_path],
            env=None,
        )

        stdio_transport = await self.exit_stack.enter_async_context(stdio_client(server_params))
        self.stdio, self.write = stdio_transport
        self.session = await self.exit_stack.enter_async_context(ClientSession(self.stdio, self.write))
        await self.session.initialize()

        response = await self.session.list_tools()
        tools = response.tools
        print("\n Connected to server with tools:", [tool.name for tool in tools])

    async def process_query(self, query: str) -> str:
        response = await self.session.list_tools()

        available_tools = []
        for tool in response.tools:
            # Start with safe defaults
            schema = tool.inputSchema or {}

            # Build Gemini-compatible schema
            gemini_schema = {
                "name": tool.name,
                "description": tool.description or "",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {}
                }
            }

            # If tool has args, map them
            if "properties" in schema:
                properties = {}
                for key, value in schema["properties"].items():
                    properties[key] = {
                        "type": value.get("type", "STRING").upper(),
                        "description": value.get("description", "")
                    }
                gemini_schema["parameters"]["properties"] = properties

            # Handle required args
            if "required" in schema:
                gemini_schema["parameters"]["required"] = schema["required"]

            available_tools.append(gemini_schema)

        print("\n[DEBUG] Tools passed to Gemini:", available_tools)

        try:
            chat_response = self.model.generate_content(
                query,
                tools=available_tools,
            )
        except Exception as e:
            return f"Gemini API Error: {e}"

        final_text = []

        candidate = chat_response.candidates[0]
        print("\n[DEBUG] Raw Gemini response:", candidate)

        for part in candidate.content.parts:
            if part.text:
                final_text.append(part.text)

            if hasattr(part, "function_call") and part.function_call:
                tool_name = part.function_call.name
                tool_args = part.function_call.args or {}
                final_text.append(f"[Gemini requested tool: {tool_name} with {tool_args}]")

                # Call the tool
                result = await self.session.call_tool(tool_name, tool_args)
                final_text.append(f"[Tool {tool_name} returned: {result.content}]")

        if not final_text:
            final_text.append("Gemini gave no usable response.")

        return "\n".join(final_text)


    async def chat_loop(self):
        """Interactive loop"""
        print("\nMCP Gemini Client Started! Type 'quit' to exit.")
        while True:
            query = input("\nQuery: ").strip()
            if query.lower() == "quit":
                break
            try:
                response = await self.process_query(query)
                print("\n" + response)
            except Exception as e:
                print(f"\nError: {e}")

    async def cleanup(self):
        await self.exit_stack.aclose()

async def main():
    if len(sys.argv) < 2:
        print("Usage: python gemini_client.py <path_to_server_script>")
        sys.exit(1)

    client = MCPGeminiClient()
    try:
        await client.connect_to_server(sys.argv[1])
        await client.chat_loop()
    finally:
        await client.cleanup()

if __name__ == "__main__":
    asyncio.run(main())