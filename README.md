# RAG for RAS — full app (frontend + backend)

A complete, working chat assistant for IEEE RAS VIT Chennai:
- **Frontend**: custom-built (no template) — animated node/circuit background, 
  custom robot-gear cursor, "alive" robot avatar, warm micro-copy, source 
  citations, feedback buttons. Located at `static/index.html`.
- **Backend**: FastAPI serving `/api/chat` (RAG: ChromaDB retrieval + Groq LLM), 
  and serving the frontend itself. `main.py`.

## Run locally
```bash
pip install -r requirements.txt
```
Set your Groq key (get a free one at console.groq.com):
```bash
# Windows PowerShell:
$env:GROQ_API_KEY="your_key_here"
# Mac/Linux:
export GROQ_API_KEY="your_key_here"
```
Build the vector database (run once, or again after editing `data/`):
```bash
python ingest.py
```
Start the server:
```bash
uvicorn main:app --reload
```
Open **http://localhost:8000** in your browser — that's your whole app, frontend and backend together.

## Deploy (free) — Render
1. Push this whole folder to a GitHub repo — **including `chroma_db/`** (run `ingest.py` locally first so it exists)
2. Go to https://render.com → New → Web Service → connect your repo
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `GROQ_API_KEY` = your key
6. Deploy — you'll get a public URL like `https://your-app.onrender.com`, which is your working deployed application link.

(Railway.app works the same way if you prefer it over Render.)

## Adding more data
Drop more `.txt`/`.md` files into `data/`, re-run `python ingest.py`, then push + redeploy.

## Notes
- The frontend calls `POST /api/chat` with `{ "message": "..." }` and expects `{ "answer": "...", "sources": [...] }` — already wired up correctly on both ends.
- Custom cursor and background animation are pure CSS/JS/canvas — no external libraries, so nothing extra to install for the frontend.
