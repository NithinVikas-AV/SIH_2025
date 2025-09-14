import asyncio
import os
import uuid
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.tools import load_mcp_tools
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import InMemorySaver
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

from privacy_gateway import *
from Audit_codes import AuditLogger

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("GEMINI_MODEL_NAME")
TEMPERATURE_FOR_GEMINI = float(os.getenv("TEMPERATURE_FOR_GEMINI"))
SESSION_ID = os.getenv("SESSION_ID") or str(uuid.uuid4())

async def main():

    llm = ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=GEMINI_API_KEY,
        temperature=TEMPERATURE_FOR_GEMINI
    )

    client = MultiServerMCPClient({
        "Medical_Emergency": {
            "command": "python",
            "args": ["D:\Hackathons\SIH 25\mcp_server.py"],
            "transport": "stdio"
        }
    })
    tools = await client.get_tools()

    checkpointer = InMemorySaver()

    agent = create_react_agent(
        model=llm,
        tools=tools,
        checkpointer=checkpointer,
        
    )

    # Initialize the audit logger (client-side only)
    audit = AuditLogger(log_dir="logs", session_id=SESSION_ID)

    system_prompt = """
        You are a multilingual mental and medical emergency assistant. 
        Your job is to:
        1. Understand and respond to urgent or emotional user inputs related to mental health or medical emergencies.
        2. If the situation requires action (like notifying a counsellor, sending an alert, or recommending resources), select and invoke the correct tool from the available options.
        3. You have access to tools such as:
        - get_medical_response: for generating general medical or mental health guidance.
        - notify_counsellor: when a user's condition is moderate and needs human intervention.
        - crisis_alert: if the user's condition is severe and requires urgent escalation.
        - suggest_resource: to recommend educational or calming resources (e.g., videos).
        - flag_misuse_alert: if someone is misusing the system (e.g., prank calls or abuse or playing with simple chats).

        Always assess the emotional tone and urgency of the message before responding or using tools.
    """

    while True:
        raw_input_text = input("Enter your query (or 'exit' to quit): ")
        if raw_input_text.lower() == 'exit':
            break

        # new_user_input = raw_input_text
        # new_user_input = pre_processing(raw_input_text, 'hin_Deva', 'eng_Latn')
        new_user_input = raw_input_text
        print(new_user_input)

        # Start the audit turn
        audit.start_interaction(raw_input_text, new_user_input, model_name=model_name)

        # Invoke the agent with callbacks so we get tool timing and model I/O
        response = await agent.ainvoke(
            {"messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": new_user_input}
                ]
            },
            config={"callbacks": [audit], "configurable": {"thread_id": SESSION_ID}}
        )

        # Finalize & write the log for this turn
        record = audit.finalize_and_write(response)

        new_response = response["messages"][-1].content
        # new_response = post_processing(response["messages"][-1].content, 'eng_Latn', 'hin_Deva')
        print("Response:", new_response)
        
if __name__ == "__main__":
    asyncio.run(main())
