import asyncio
import os
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.tools import load_mcp_tools
from langgraph.prebuilt import create_react_agent
from langchain_google_genai import ChatGoogleGenerativeAI

from dotenv import load_dotenv
load_dotenv()

from privacy_gateway import *

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

async def main():
    
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GEMINI_API_KEY, temperature=0.7)

    # Connect to MCP server(s) - assuming your existing server setup
    client = MultiServerMCPClient({
        "Medical_Emergency": {
            "command": "python",
            "args": ["D:\Hackathons\SIH 25\MCP\mcp_server.py"],
            "transport": "stdio"
        }
    })

    tools = await client.get_tools()

    agent = create_react_agent(
        model=llm, 
        tools=tools,
    )

    while True:
        user_input = input("Enter your query (or 'exit' to quit): ")
        
        if user_input.lower() == 'exit':
            break
        
        new_user_input = pre_processing(user_input, 'hin_Deva', 'eng_Latn')

        print(new_user_input)

        response = await agent.ainvoke({"messages": [{"role": "user", "content": new_user_input}]})

        new_response = post_processing(response["messages"][-1].content, 'eng_Latn', 'hin_Deva')
        
        print("Response:", new_response)

if __name__ == "__main__":
    asyncio.run(main())