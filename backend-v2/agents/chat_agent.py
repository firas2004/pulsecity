import requests
from config import settings

class ChatAgent:
    def __init__(self):
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama-3.1-8b-instant"

    def ask(self, system_prompt: str, user_message: str, api_key: str = None) -> str:
        key = api_key if (api_key and api_key.strip()) else settings.GROQ_API_KEY
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.2
        }
        
        try:
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                error_msg = f"Groq API Error: {response.status_code} - {response.text}"
                print(error_msg)
                return f"Erreur de communication avec l'assistant IA (code {response.status_code})."
        except Exception as e:
            print(f"Exception calling Groq API: {e}")
            return "Désolé, l'assistant intelligent n'est pas disponible pour le moment."

chat_agent = ChatAgent()
