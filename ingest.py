"""
ingest.py
Reads all .txt/.md files from ./data, chunks them, embeds them,
and stores them in a local ChromaDB vector store (./chroma_db).

Run this once (and again whenever you add/update data files):
    python ingest.py
"""

import os
import glob
import chromadb
from chromadb.utils import embedding_functions

DATA_DIR = "data"
DB_DIR = "chroma_db"
COLLECTION_NAME = "ieee_ras_docs"
CHUNK_SIZE = 800       # characters per chunk
CHUNK_OVERLAP = 150    # overlap between chunks


def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """Paragraph-aware chunker — never splits mid-word or mid-sentence."""
    text = text.strip()
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    chunks = []
    current = ""

    for para in paragraphs:
        if len(current) + len(para) + 2 <= chunk_size:
            current = f"{current}\n\n{para}" if current else para
        else:
            if current:
                chunks.append(current.strip())
            if len(para) > chunk_size:
                # Paragraph itself is too long — split on sentences instead
                sentences = para.replace("\n", " ").split(". ")
                current = ""
                for sent in sentences:
                    sent = sent.strip()
                    if not sent:
                        continue
                    candidate = f"{current} {sent}." if current else f"{sent}."
                    if len(candidate) <= chunk_size:
                        current = candidate
                    else:
                        if current:
                            chunks.append(current.strip())
                        current = f"{sent}."
            else:
                current = para

    if current:
        chunks.append(current.strip())

    return chunks

def load_documents():
    docs = []
    for filepath in glob.glob(os.path.join(DATA_DIR, "*.*")):
        if filepath.endswith((".txt", ".md")):
            with open(filepath, "r", encoding="utf-8") as f:
                text = f.read()
            source_name = os.path.basename(filepath)
            for i, chunk in enumerate(chunk_text(text)):
                docs.append({
                    "id": f"{source_name}-{i}",
                    "text": chunk,
                    "source": source_name,
                })
    return docs


def main():
    print("Loading documents from ./data ...")
    docs = load_documents()
    print(f"Found {len(docs)} chunks from files in ./data")

    if not docs:
        print("No documents found! Add .txt or .md files to the data/ folder first.")
        return

    print("Setting up embedding function (ChromaDB's built-in ONNX MiniLM, no torch needed)...")
    # ChromaDB ships its own lightweight ONNX-based MiniLM embedding function.
    # It only depends on onnxruntime (already a chromadb dependency), not
    # torch/transformers/sentence-transformers — this keeps memory usage low
    # enough to run on free-tier hosts like Render's 512MB instances.
    embed_fn = embedding_functions.DefaultEmbeddingFunction()

    print("Initializing ChromaDB...")
    client = chromadb.PersistentClient(path=DB_DIR)

    # Fresh collection each time we ingest
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    collection = client.create_collection(
        name=COLLECTION_NAME,
        embedding_function=embed_fn,
    )

    collection.add(
        ids=[d["id"] for d in docs],
        documents=[d["text"] for d in docs],
        metadatas=[{"source": d["source"]} for d in docs],
    )

    print(f"Done! Ingested {len(docs)} chunks into '{COLLECTION_NAME}' at ./{DB_DIR}")


if __name__ == "__main__":
    main()