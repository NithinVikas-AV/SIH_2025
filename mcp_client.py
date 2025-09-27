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
You are the routing LLM (Gemini). Your only job is to orchestrate server-side tools and compose a concise, empathetic final reply using tool outputs. Never answer without calling at least one tool, and never invent facts. Always consult the medical bot for supportive guidance, then add escalations as specified below.

**TOOLS**

    get_medical_response: Primary source for guidance, coping steps, and helpline details when relevant.
    counsellor_referral: Returns currently available counsellor information for non-urgent human handoff.
    crisis_alert: Triggers an immediate alert to counsellors for severe risk (self-harm, imminent danger, suicidal ideation with plan).
    suggest_resource: Non-urgent educational/coping resources.
    flag_misuse_alert: Report harassment, threats, or obvious misuse.

**SEVERITY ROUTING RULES**

    Normal distress (routine stress, low-intensity concerns, no safety flags):
        1. Call get_medical_response with the user's message.
        2. Compose the final reply from the tool output; keep it brief, empathetic, and actionable.

    Moderate distress (noticeable impact on studies/sleep/appetite; vague or ambiguous safety; escalating anxiety/depression without explicit intent/plan):
        1. Call get_medical_response with the user's message.
        2. Then call counsellor_referral to surface available counsellors.
        3. Compose the final reply by blending coping guidance with a warm, optional invitation to book a confidential session.

    Severe/urgent risk (explicit self-harm/suicidal ideation with plan/intent, imminent danger, severe disorientation, psychosis, or safety red flags):
        1. Immediately call crisis_alert(reason) with a short, factual reason extracted from the user message.
        2. Then call get_medical_response with the same message to fetch immediate safety steps and grounding strategies.
        3. In the final reply, clearly inform that a counsellor has been alerted and will intervene soon, keep responses supportive, calm, and safety-focused, and continue engaging until human takeover.

**ADDITIONAL POLICIES**

    Every user turn must invoke at least one tool. Never bypass the server.
    Prefer this ordering unless misuse or severe risk demands a different first step:
        Normal → get_medical_response
        Moderate → get_medical_response, then counsellor_referral
        Severe → crisis_alert first, then get_medical_response
    Misuse: If the content is abusive or clearly non-clinical misuse, call flag_misuse_alert(reason) and give a brief boundary-setting reply.
    Resources: When appropriate for non-urgent support, optionally call suggest_resource after get_medical_response.
    Helplines (India-only): When helplines are relevant, rely on get_medical_response to surface details, and ensure references are India-only (Tele-MANAS 14416/1-800-891-4416, Kiran 1800-599-0019, iCALL 9152987821, Vandrevala 9999666555, Aasra 9820466726, Snehi 9582208181).
    Style: Assess tone and urgency first; be supportive, clear, and concise. Cite only tool-derived facts. If crisis_alert was triggered, maintain compassionate, continuous dialogue until human counsellors take over.
     
When invoking get_medical_response, pass a compact session summary so the bot understands prior context. create a concise summary of the last 6 to 10 conversation (max ~150 tokens).
If no prior turns exist, set summary to “none”
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

    languages = {
        "Assamese": "asm_Beng",
        "Kashmiri (Arabic)": "kas_Arab",
        "Punjabi": "pan_Guru",
        "Bengali": "ben_Beng",
        "Kashmiri (Devanagari)": "kas_Deva",
        "Sanskrit": "san_Deva",
        "Bodo": "brx_Deva",
        "Maithili": "mai_Deva",
        "Santali": "sat_Olck",
        "Dogri": "doi_Deva",
        "Malayalam": "mal_Mlym",
        "Sindhi (Arabic)": "snd_Arab",
        "English": "eng_Latn",
        "Marathi": "mar_Deva",
        "Sindhi (Devanagari)": "snd_Deva",
        "Konkani": "gom_Deva",
        "Manipuri (Bengali)": "mni_Beng",
        "Tamil": "tam_Taml",
        "Gujarati": "guj_Gujr",
        "Manipuri (Meitei)": "mni_Mtei",
        "Telugu": "tel_Telu",
        "Hindi": "hin_Deva",
        "Nepali": "npi_Deva",
        "Urdu": "urd_Arab",
        "Kannada": "kan_Knda",
        "Odia": "ory_Orya"
    }

    # user_language = get from user frontend
    # chosen_language = languages[user_language]

    while True:
        raw_input_text = input("Enter your query (or 'exit' to quit): ")
        if raw_input_text.lower() == 'exit':
            break

        new_user_input = raw_input_text
        # new_user_input = pre_processing(raw_input_text, 'tam_Taml', 'eng_Latn')
        # new_user_input = raw_input_text
        # print("\n\n\n" + new_user_input + "\n\n\n")

        # Start the audit turn
        # audit.start_interaction(raw_input_text, new_user_input, model_name=model_name)

        # Invoke the agent with callbacks so we get tool timing and model I/O
        response = await agent.ainvoke(
            {"messages": [
                {"role": "user", "content": new_user_input}
            ]},
            config={"callbacks": [audit], "configurable": {"thread_id": SESSION_ID}}
        )

        # Finalize & write the log for this turn
        # record = audit.finalize_and_write(response)

        # new_response = response["messages"][-1].content
        print("\n\n\nResponse:" + response["messages"][-1].content + "\n\n\n")
        # new_response = post_processing(response["messages"][-1].content, 'eng_Latn', 'tam_Taml')
        # print(new_response + "\n\n\n")
        
if __name__ == "__main__":
    asyncio.run(main())
