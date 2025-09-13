import psycopg2
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
DB_URL = os.getenv("DB_URL")

def get_available_counselors():
    try:
        llm = ChatGoogleGenerativeAI(model='gemini-1.5-flash', google_api_key=api_key)
        prompt = "You are an assistant that read through the records and report which counsellor is avilable.\n\n"
        conn = psycopg2.connect(DB_URL, sslmode="require")
        cur = conn.cursor()

        query = """
        SELECT id, name, current_availability
        FROM counselor_profiles;
        """
        cur.execute(query)
        rows = cur.fetchall()

        counsellor_details = "ID: {id}, Name: {name}, Availability: {availability}"

        for row in rows:
            prompt += counsellor_details.format(id = row[0], name = row[1], availability = row[2])

        response = llm.invoke(prompt)
        
        print(response.content)

        cur.close()
        conn.close()

    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    get_available_counselors()
