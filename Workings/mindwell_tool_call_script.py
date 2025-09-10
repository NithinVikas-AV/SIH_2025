from langchain_ollama import ChatOllama
from langchain_core.tools import tool
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from typing import Any, Dict

# Define the tool
@tool
def notify_counsellor() -> str:
    """Notify a counsellor immediately if the user expresses suicidal thoughts, severe depression, or intent to harm themselves."""
    print("counsellor notified")
    return "Counsellor has been notified successfully."

# Initialize ChatOllama (supports tool binding)
llm = ChatOllama(model="ALIENTELLIGENCE/mindwell")

# Bind tools
llm_with_tools = llm.bind_tools([notify_counsellor])

# Custom prompt to enforce tool use
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a mental health assistant. If the user shows severe distress (e.g., suicidal thoughts), respond ONLY with a tool call to 'notify_counsellor' in JSON format. Do not simulate calls or provide advice/hotlines first. After the tool runs, give empathetic support."""),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

# Create the agent
agent = create_tool_calling_agent(llm_with_tools, [notify_counsellor], prompt)

# Set up executor with verbose output for debugging
agent_executor = AgentExecutor(agent=agent, tools=[notify_counsellor], verbose=True, max_iterations=3)

# User's input
user_input = """I am feeling so depressed cause i have pcod issues and because of that i look very stout and lot of my friends , family and even strangers look at me differently ,ill treat ,discriminate me. At times i feel very low and i feel like why on earth i should live and isn’t there a single soul who likes and cares for me.These thoughts even make me feel like dying.
What do i do help me with my situation. Dont give me any medical diagnosis and avoid unnecessary informations"""

# Run the agent
response = agent_executor.invoke({"input": user_input})

# Fallback: If the output isn't structured, try parsing for embedded JSON
parser = JsonOutputParser()
try:
    parsed_output = parser.parse(response["output"])
    print("Parsed Output:", parsed_output)
except Exception:
    print("Final Response:", response["output"])