import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DB_URL")

def alert_counselors(reason: str) -> str:
    try:
        conn = psycopg2.connect(DB_URL, sslmode="require")
        cur = conn.cursor()

        query = f"""
        INSERT INTO crisis_alerts (alert_type, severity_level, description, status, created_at)
            VALUES ('ai_detected', 8, '{reason}', 'active', CURRENT_TIMESTAMP)
        """
        cur.execute(query)

        conn.commit()

        cur.close()
        conn.close()
        
        return "Counsellor Alerted Successful" 
    
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    alert_counselors('User showing signs of severe anxiety')
