import chromadb

DB_DIR = "chroma_db"
COLLECTION_NAME = "ieee_ras_docs"

client = chromadb.PersistentClient(path=DB_DIR)
collection = client.get_collection(name=COLLECTION_NAME)

query = "Explain about RAS"
results = collection.query(query_texts=[query], n_results=5)

for i, (doc, meta) in enumerate(zip(results["documents"][0], results["metadatas"][0])):
    print(f"\n--- Result {i+1} (source: {meta['source']}) ---")
    print(doc[:300])