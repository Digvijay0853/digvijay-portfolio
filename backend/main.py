
# =========================================
# 1. IMPORT REQUIRED LIBRARIES
# =========================================

import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI, OpenAIError
from pydantic import BaseModel, Field


# =========================================
# 2. LOAD ENVIRONMENT VARIABLES
# =========================================

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

if not API_KEY:
    raise RuntimeError("OPENAI_API_KEY is missing from .env")


# =========================================
# 3. INITIALIZE OPENAI CLIENT
# =========================================

client = OpenAI(api_key=API_KEY)


# =========================================
# 4. CREATE FASTAPI APPLICATION
# =========================================

app = FastAPI(
    title="Digvijay Portfolio AI Assistant",
    description="AI chatbot for my professional portfolio",
    version="1.0.0"
)


# =========================================
# 5. CONFIGURE CORS
# =========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://digvijay-portfolio-1.onrender.com"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"]
)


# =========================================
# 6. DEFINE REQUEST MODEL
# =========================================

class ChatRequest(BaseModel):

    message: str = Field(
        min_length=1,
        max_length=1000
    )


# =========================================
# 7. PORTFOLIO INFORMATION
# =========================================

PORTFOLIO_CONTEXT = """
You are the AI assistant for Digvijay Chavan's
professional portfolio.

Your job is to answer recruiters' questions about
Digvijay's professional background.

PROFESSIONAL PROFILE:

Name: Digvijay Chavan

Role: Python Backend Developer and Generative AI Developer.

Experience: Around 2 years of Python development experience.

EDUCATION:

B.Sc. Chemistry, 2022.
Savitribai Phule Pune University.

WORK EXPERIENCE:

Python Developer at TestYantra Software Solutions.
May 2023 to November 2024.

TECHNICAL SKILLS:

Python, Django, Django REST Framework, FastAPI,
REST APIs, MySQL, Oracle, SQL, JWT Authentication,
Git and GitHub.

GENERATIVE AI SKILLS:

LangChain, LangGraph, RAG, LLM Integration,
Pydantic and Prompt Engineering.

AI TOOLS:

Claude and Groq.

PROJECT 1:

AI-Powered Blog Generator.

Technologies:
Python, LangChain, LangGraph, RAG,
LLM Integration, Pydantic and Prompt Engineering.

Description:
An AI-powered application for generating blog
content using LLM integration and structured output.

PROJECT 2:

Restaurant and Food Ordering Management System.

Technologies:
Python, Django, Django REST Framework,
FastAPI and MySQL.

Description:
A backend application for restaurant operations,
menu management, carts, orders and REST APIs.

CONTACT:

Email: dchavan0853@gmail.com
Phone: +91 90220 64548

LinkedIn:
https://www.linkedin.com/in/digvijaychavansd

GitHub:
https://github.com/Digvijay0853

IMPORTANT INSTRUCTIONS:

1. Answer only questions related to Digvijay's
   profile, skills, experience, projects and contact.

2. Be professional, friendly and concise.

3. Do not invent achievements, certifications,
   employment dates or project results.

4. If information is unavailable, clearly say
   that the information is not provided.

5. Do not claim that Digvijay has experience
   with technologies not listed above.

6. If someone asks an unrelated question,
   politely guide them back to Digvijay's portfolio.
"""


# =========================================
# 8. CREATE HOME ROUTE
# =========================================

@app.get("/")
def home():

    return {
        "message": "Digvijay Portfolio AI Backend is running!"
    }


# =========================================
# 9. CREATE HEALTH CHECK ROUTE
# =========================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# =========================================
# 10. CREATE CHAT API
# =========================================

@app.post("/chat")
def chat(request: ChatRequest):

    try:

        response = client.responses.create(

            model=MODEL,

            instructions=PORTFOLIO_CONTEXT,

            input=request.message

        )

        return {
            "reply": response.output_text
        }

    except OpenAIError:
        
        raise HTTPException(
            status_code=502,
            detail="The AI service could not process your request."
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="An unexpected server error occurred."
        )
class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    history: list[dict] = Field(default_factory=list)

@app.post("/chat")
def chat(request: ChatRequest):
    try:

        conversation = []

        # Include previous conversation
        for item in request.history[-20:]:

            if item.get("role") not in ["user", "assistant"]:
                continue

            content = item.get("content", "")

            if not isinstance(content, str):
                continue

            conversation.append({
                "role": item["role"],
                "content": content[:2000]
            })

        # Add current question
        conversation.append({
            "role": "user",
            "content": request.message
        })

        response = client.responses.create(
            model=MODEL,
            instructions=PORTFOLIO_CONTEXT,
            input=conversation
        )

        return {
            "reply": response.output_text
        }

    except OpenAIError:
        raise HTTPException(
            status_code=502,
            detail="The AI service could not process your request."
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An unexpected server error occurred."
        )