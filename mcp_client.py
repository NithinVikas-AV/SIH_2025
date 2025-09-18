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

    client = MultiServerMCPClient({
        "Medical_Emergency": {
            "command": "python",
            "args": ["D:\Hackathons\SIH 25\mcp_server.py"],
            "transport": "stdio"
        }
    })

    tools = await client.get_tools()

    llm = ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=GEMINI_API_KEY,
        temperature=TEMPERATURE_FOR_GEMINI
    )

    system_prompt = """
        You are the routing LLM (Gemini). Your sole responsibility is to orchestrate server-side agents exposed as MCP tools (the Mindwell agent on the MCP server) and compose a concise, empathetic final reply. Do not invent facts; do not answer directly without using tools.
		
		TOOLS (Mindwell on MCP Server):
		- get_medical_response(query: str): Primary tool for guidance on mental/medical queries; also returns helpline information when needed.
		- counsellor_referral(): Use when the user seems moderately distressed and should be connected to a counsellor.
		- crisis_alert(reason: str): Use immediately for severe or urgent risk (self-harm, imminent danger, suicidal ideation with plan).
		- suggest_resource(search_bar: str): Use for non-urgent support like educational/coping resources.
		- flag_misuse_alert(reason: str): Use if the user appears to misuse/abuse the system.
		
		ROUTING POLICY:
		- Every user turn must invoke at least one MCP tool. Never bypass the server.
		- Begin by calling get_medical_response with the user's message, unless the content clearly requires flag_misuse_alert or immediate crisis_alert first.
		- After the primary call, consider secondary tools (counsellor_referral, crisis_alert, suggest_resource, flag_misuse_alert) based on severity and context.
		- Summarize and present the tool outputs as a single final answer to the user.
		
        HELPLINE POLICY (INDIA-ONLY):
		- When helplines are relevant, consult Mindwell (via get_medical_response) for helpline details.
		- If any tool output includes helplines from outside India (UK/US/other), you must replace them in your composed answer with India-only helplines.
		- Prefer: Tele-MANAS (14416 or 1-800-891-4416), Kiran (1800-599-0019), iCALL (9152987821), Vandrevala (9999666555), Aasra (9820466726), Snehi (9582208181).
		- If unsure about a country, omit that number and provide only Indian helplines.
		
		GENERAL STYLE:
		- Assess tone and urgency first; be supportive and clear.
		- Keep answers brief, with actionable next steps. Cite tool-derived facts only.

    """

    checkpointer = InMemorySaver()

    agent = create_react_agent(
        model=llm,
        tools=tools,
        checkpointer=checkpointer,
        prompt=system_prompt
    )

    # Initialize the audit logger (client-side only)
    audit = AuditLogger(log_dir="logs", session_id=SESSION_ID)

    while True:
        raw_input_text = input("Enter your query (or 'exit' to quit): ")
        if raw_input_text.lower() == 'exit':
            break

        new_user_input = raw_input_text
        new_user_input = pre_processing(raw_input_text, 'tam_Taml', 'eng_Latn')
        # new_user_input = raw_input_text
        # print(new_user_input)

        # Start the audit turn
        audit.start_interaction(raw_input_text, new_user_input, model_name=model_name)

        # Invoke the agent with callbacks so we get tool timing and model I/O
        response = await agent.ainvoke(
            {"messages": [
                {"role": "user", "content": new_user_input}
            ]},
            config={"callbacks": [audit], "configurable": {"thread_id": SESSION_ID}}
        )

        # Finalize & write the log for this turn
        record = audit.finalize_and_write(response)

        # new_response = response["messages"][-1].content
        new_response = post_processing(response["messages"][-1].content, 'eng_Latn', 'tam_Taml')
        print("Response:", new_response)
        
if __name__ == "__main__":
    asyncio.run(main())
