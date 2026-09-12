"""
main.py — RAG for RAS backend

Serves:
  - POST /api/chat   { "message": "..." }  ->  { "answer": "...", "sources": ["..."] }
  - GET  /            the frontend (index.html)

Run locally:
    pip install -r requirements.txt
    export GROQ_API_KEY="your_key_here"      (PowerShell: $env:GROQ_API_KEY="your_key_here")
    python ingest.py                          (builds chroma_db/ from data/)
    uvicorn main:app --reload

Deploy (Render / Railway, free tier):
    1. Push this whole folder to GitHub (including chroma_db/ after running ingest.py)
    2. Create a new Web Service pointing at the repo
    3. Build command:  pip install -r requirements.txt
       Start command:   uvicorn main:app --host 0.0.0.0 --port $PORT
    4. Add GROQ_API_KEY as an environment variable in the host's dashboard
    5. You'll get a public URL like https://your-app.onrender.com
"""

import os
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import chromadb
from chromadb.utils import embedding_functions
from groq import Groq

# ---------- CONFIG ----------
DB_DIR = "chroma_db"
COLLECTION_NAME = "ieee_ras_docs"
LLM_MODEL = "openai/gpt-oss-20b"
TOP_K = 8
CHAPTER_NAME = "IEEE RAS VIT Chennai"
CHAPTER_URL = "https://edu.ieee.org/in-rasvitcc/"

app = FastAPI(title="RAG for RAS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten this to your actual frontend domain once deployed
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- LOAD RESOURCES ONCE AT STARTUP ----------
# ChromaDB's built-in ONNX MiniLM embedding function — only depends on
# onnxruntime (already a chromadb dependency), avoiding torch/transformers/
# sentence-transformers entirely to keep memory usage low enough for
# free-tier hosts like Render's 512MB instances.
embed_fn = embedding_functions.DefaultEmbeddingFunction()
chroma_client = chromadb.PersistentClient(path=DB_DIR)
collection = chroma_client.get_collection(name=COLLECTION_NAME, embedding_function=embed_fn)

groq_api_key = os.environ.get("GROQ_API_KEY")
if not groq_api_key:
    raise RuntimeError("GROQ_API_KEY environment variable is not set.")
groq_client = Groq(api_key=groq_api_key)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]


def retrieve_context(query: str, k: int = TOP_K):
    print("Collection count:", collection.count())
    results = collection.query(query_texts=[query], n_results=k)
    chunks = results["documents"][0]
    sources = [meta["source"] for meta in results["metadatas"][0]]
    print("Retrieved chunks:", chunks)
    print("Sources:", sources)
    return chunks, sources


def clean_markdown(text: str) -> str:
    """Strip common markdown formatting so plain-text frontends render cleanly."""
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)   # **bold** -> bold
    text = re.sub(r'\*(.*?)\*', r'\1', text)       # *italic* -> italic
    text = re.sub(r'`(.*?)`', r'\1', text)         # `code` -> code
    text = re.sub(r'#{1,6}\s*', '', text)          # # Heading -> Heading
    text = text.replace('<br>', '\n').replace('<br/>', '\n').replace('<br />', '\n')
    return text.strip()


def generate_answer(query: str, chunks: list[str]) -> str:
    context_text = "\n\n---\n\n".join(chunks)
    system_prompt = (
        f"You are the official {CHAPTER_NAME} assistant. "
        "Answer the user's question using ONLY the context provided below. "
        "Be friendly, concise, and specific (mention event names, dates, numbers when relevant). "
        "Respond in plain text only. Do not use markdown formatting such as ** for bold, "
        "# for headings, backticks, or | for tables. Do not use HTML tags like <br>. "
        "Use plain sentences, natural line breaks, and dashes (-) for lists instead. "
        "If the answer isn't in the context, say you don't have that information yet, "
        f"and suggest checking the official page: {CHAPTER_URL}\n\n"
        f"CONTEXT:\n{context_text}"
    )
    response = groq_client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query},
        ],
        temperature=0.3,
        max_tokens=500,
    )
    answer = response.choices[0].message.content
    return clean_markdown(answer)


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    chunks, sources = retrieve_context(req.message)
    answer = generate_answer(req.message, chunks)
    return ChatResponse(answer=answer, sources=sources)


# ---------- Serve the frontend ----------
# Place your built index.html (+ any assets) inside a "static" folder next to this file.
# Mounting the whole folder (not just /assets) so root-level files like the logo
# (anything from Vite's public/ folder) are served too, not just the /assets bundle.
if os.path.isdir("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")