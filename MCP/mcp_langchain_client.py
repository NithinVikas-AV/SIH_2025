import asyncio
import os
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.tools import load_mcp_tools
from langgraph.prebuilt import create_react_agent
from langchain_google_genai import ChatGoogleGenerativeAI

from dotenv import load_dotenv
load_dotenv()

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

    # Load tools from MCP server
    tools = await client.get_tools()

    print(tools)

    # Create LangChain ReAct agent
    agent = create_react_agent(
        llm=llm, 
        tools=tools,
    )

    while True:
        query = input("Enter your query (or 'exit' to quit): ")
        
        if query.lower() == 'exit':
            break
        
        response = await agent.ainvoke({"messages": [{"role": "user", "content": query}]})
        
        print("Response:", response["messages"][-1].content)

if __name__ == "__main__":
    asyncio.run(main())