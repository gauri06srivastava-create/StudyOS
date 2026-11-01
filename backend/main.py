
import os
import json
import shutil

import fitz
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel

load_dotenv()

client = Groq()

app = FastAPI(title="StudyOS API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "https://study-os-mocha-psi.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# Request Models
class NotesRequest(BaseModel):
    text: str


class AskRequest(BaseModel):
    text: str
    question: str


class QuizRequest(BaseModel):
    text: str
    num_questions: int = 5


class StudyPlanRequest(BaseModel):
    subjects: str
    exam_date: str
    daily_hours: int
    weak_topics: str = ""


# Home
@app.get("/")
def home():
    return {"message": "Welcome to StudyOS Backend!"}


# Health Check
@app.get("/health")
def health():
    return {"status": "healthy"}


# Upload PDF
@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        return {"error": "Only PDF files are allowed"}

    filename = os.path.basename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        document = fitz.open(file_path)

        extracted_text = ""

        for page in document:
            extracted_text += page.get_text()

        document.close()

        return {
            "filename": filename,
            "message": "PDF uploaded successfully!",
            "text": extracted_text,
            "total_characters": len(extracted_text)
        }

    except Exception as e:
        return {"error": str(e)}


# Ask Your PDF
@app.post("/ask-pdf")
def ask_pdf(request: AskRequest):

    if not request.text.strip():
        return {"error": "No document text provided"}

    if not request.question.strip():
        return {"error": "Please enter a question"}

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": """
                    You are StudyOS AI Tutor.

                    Answer the student's question using ONLY
                    the provided PDF content.

                    Explain concepts in simple language.
                    Use examples when the PDF provides them.

                    If the answer is not available in the PDF,
                    clearly say:
                    'This information is not available in
                    the uploaded document.'

                    Do not invent facts.
                    """
                },
                {
                    "role": "user",
                    "content": f"""
                    PDF CONTENT:
                    {request.text[:20000]}

                    STUDENT QUESTION:
                    {request.question}
                    """
                }
            ],
            temperature=0.3
        )

        return {
            "answer": response.choices[0].message.content
        }

    except Exception as e:
        return {"error": str(e)}


# Generate Quiz
@app.post("/generate-quiz")
def generate_quiz(request: QuizRequest):

    if not request.text.strip():
        return {"error": "No document text provided"}

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": """
                    You are StudyOS Quiz Generator.

                    Generate multiple choice questions using
                    ONLY the supplied PDF content.

                    Return ONLY valid JSON in this format:

                    {
                      "questions": [
                        {
                          "question": "Question text",
                          "topic": "Main concept being tested",
                          "options": [
                            "Option A",
                            "Option B",
                            "Option C",
                            "Option D"
                          ],
                          "answer": "Option A",
                          "explanation": "Short explanation"
                        }
                      ]
                    }

                    Rules:
                    - Each question must have exactly 4 options.
                    - Only one correct answer.
                    - Answer must exactly match one option.
                    - Topic must be a short, specific concept name
                      taken from the PDF.
                    - Questions about the same concept should use
                      the same topic name.
                    - Do not invent information.
                    - Do not include Markdown code fences.
                    - Return valid JSON only.
                    """
                },
                {
                    "role": "user",
                    "content": f"""
                    Generate {request.num_questions} MCQs
                    from this PDF content:

                    {request.text[:20000]}
                    """
                }
            ],
            temperature=0.3
        )

        result = response.choices[0].message.content
        quiz_data = json.loads(result)

        return quiz_data

    except json.JSONDecodeError:
        return {
            "error": "AI returned an invalid quiz format. Please try again."
        }

    except Exception as e:
        return {"error": str(e)}


# Generate Notes
@app.post("/generate-notes")
def generate_notes(request: NotesRequest):

    if not request.text.strip():
        return {"error": "No PDF text provided"}

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": """
                    You are StudyOS, an academic notes assistant.

                    Generate clear and structured study notes
                    using only the supplied PDF content.

                    Include:
                    1. Topic heading
                    2. Important concepts
                    3. Definitions
                    4. Key points
                    5. Short revision summary

                    Do not invent information.
                    If something is not explained in the PDF,
                    do not add it.
                    """
                },
                {
                    "role": "user",
                    "content": request.text[:20000]
                }
            ],
            temperature=0.3
        )

        notes = response.choices[0].message.content

        return {"notes": notes}

    except Exception as e:
        return {"error": str(e)}


# AI Study Planner
@app.post("/generate-study-plan")
def generate_study_plan(request: StudyPlanRequest):

    prompt = f"""
    Create a realistic and personalized study timetable.

    Subjects: {request.subjects}
    Exam Date: {request.exam_date}
    Available study hours per day: {request.daily_hours}
    Weak topics: {request.weak_topics}

    Instructions:
    1. Divide preparation into days until the exam.
    2. Give extra priority to weak topics.
    3. Include revision and practice sessions.
    4. Keep the daily schedule within the available study hours.
    5. Use a clear day-wise format.
    6. Include short breaks between study sessions.
    7. Do not invent subjects or topics not provided by the student.

    Return a clear, easy-to-follow study plan.
    """

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert academic study planner."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4
        )

        plan = response.choices[0].message.content

        return {"plan": plan}

    except Exception as e:
        return {"error": str(e)}
