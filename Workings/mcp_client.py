import asyncio
import sys
import json
from typing import Optional
from contextlib import AsyncExitStack

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

import google.generativeai as genai
from dotenv import load_dotenv
import os

from prompt_engineering import * 
from privacy_gateway import *

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

class MCPGeminiClient:
    
    def __init__(self):
        self.session: Optional[ClientSession] = None
        self.exit_stack = AsyncExitStack()
        self.model = genai.GenerativeModel("gemini-2.5-flash")

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
        print("\nConnected to server with tools:", [tool.name for tool in tools])

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

        # print("\n[DEBUG] Tools passed to Gemini:", available_tools)

        try:
            chat_response = self.model.generate_content(
                query,
                tools=available_tools,
            )
        except Exception as e:
            return f"Gemini API Error: {e}"

        final_text = []

        candidate = chat_response.candidates[0]
        # print("\n[DEBUG] Raw Gemini response:", candidate)

        for part in candidate.content.parts:
            if part.text:
                final_text.append(part.text)

            if hasattr(part, "function_call") and part.function_call:
                tool_name = part.function_call.name
                tool_args = part.function_call.args or {}
                # final_text.append(f"[Gemini requested tool: {tool_name} with {tool_args}]")

                # Call the tool
                result = await self.session.call_tool(tool_name, tool_args)
                # final_text.append(f"[Tool {tool_name} returned: {result.content}]")
                for item in result.content:
                    if hasattr(item, "text"):
                        final_text.append(item.text)

        if not final_text:
            final_text.append("Gemini gave no usable response.")

        return "\n".join(final_text)

    async def chat_loop(self):
        """Interactive loop"""
        print("\nMCP Gemini Client Started! Type 'quit' to exit.")
        # messages = [
        #     {"role": "system", "content": medical_prompt()},
        # ]
        while True:
            user_input = input("\nYou: ").strip()
            if user_input.lower() == "quit":
                break
            new_query = pre_processing(user_input, 'hin_Deva', 'eng_Latn')
            print(f"\n{new_query}")
            # messages.append({"role": "user", "content": user_input})
            try:
                ai_response = await self.process_query(new_query)
                new_ai_response = post_processing(ai_response, 'eng_Latn', 'hin_Deva')
                print("\nBot: " + new_ai_response)
                # print("\nBot :", ai_response)
                # messages.append({"role": "assistant", "content": response})
            except Exception as e:
                print(f"\nError: {e}")

    async def cleanup(self):
        await self.exit_stack.aclose()

async def main():

    config_path = os.getenv("CONFIG_FILE_NAME")
    if not os.path.exists(config_path):
        print(f"Config file not found: {config_path}")
        sys.exit(1)

    with open(config_path, "r") as f:
        config = json.load(f)

    server_script_path = config.get("server", {}).get("path")
    if not server_script_path:
        print("Server script path not found in config.")
        sys.exit(1)

    client = MCPGeminiClient()
    try:
        await client.connect_to_server(server_script_path)
        await client.chat_loop()
    finally:
        await client.cleanup()

if __name__ == "__main__":
    asyncio.run(main())