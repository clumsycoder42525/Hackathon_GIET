import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

async def get_ai_chat_response(message: str, history: list):
    system_prompt = """
    You are an AI Student Companion. You provide empathetic, academic help.
    Return JSON: { "response": "text", "detectedTone": "stressed/confused/motivated", "empathyTip": "tip" }
    """
    
    messages = [{"role": "system", "content": system_prompt}] + history + [{"role": "user", "content": message}]
    
    completion = client.chat.completions.create(
        messages=messages,
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"}
    )
    
    return json.loads(completion.choices[0].message.content)

async def generate_structured_notes(text: str = None, audio_file_path: str = None):
    input_content = text
    
    if audio_file_path:
        with open(audio_file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(audio_file_path, file.read()),
                model="whisper-large-v3",
            )
        input_content = transcription.text
        # Optional: remove temporary file after transcription
        # os.remove(audio_file_path)

    prompt = f"Convert to structured notes: {input_content}. Return JSON: {{ \"structuredNotes\": \"md\", \"summary\": \"text\", \"keyConcepts\": [], \"importantQuestions\": [] }}"
    
    completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"}
    )
    
    return json.loads(completion.choices[0].message.content)

async def analyze_wellbeing(sleep: float, diet: str, activity: str):
    prompt = f"Analyze wellbeing: Sleep {sleep}h, Diet {diet}, Activity {activity}. Return JSON: {{ \"insights\": [], \"riskLevel\": \"\", \"suggestions\": [] }}"
    
    completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"}
    )
    
    return json.loads(completion.choices[0].message.content)

async def generate_focus_report_ai(duration: int, distractions: int):
    prompt = f"Generate focus report for a {duration}s session with {distractions} distractions. Return JSON: {{ \"focusScore\": 0, \"efficiencyAnalysis\": \"\", \"tips\": [] }}"
    
    completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        response_format={"type": "json_object"}
    )
    
    return json.loads(completion.choices[0].message.content)
async def transcribe_audio(audio_file_path: str):
    if not audio_file_path or not os.path.exists(audio_file_path):
        return ""
    
    try:
        with open(audio_file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=("voice_recording.webm", file),
                model="whisper-large-v3",
            )
        return transcription.text
    except Exception as e:
        print(f"WHISPER ERROR: {str(e)}")
        raise e
