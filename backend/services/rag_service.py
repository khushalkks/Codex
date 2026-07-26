import os
import re
import numpy as np
from datetime import datetime
from bson.objectid import ObjectId
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from config.db import get_database

# Initialize Gemini if API key is present
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
HAS_GEMINI = False
if GEMINI_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_KEY)
        HAS_GEMINI = True
    except Exception as e:
        print(f"[RAG] Failed to configure google-generativeai: {e}")

def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """
    Splits document text into overlapping chunks, respecting paragraph and sentence boundaries.
    """
    text = (text or "").strip()
    if not text:
        return []
    
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        
        # Try to find a clean boundary (newline or sentence end) in the last 150 chars
        if end < len(text):
            boundary = -1
            # Search for double/single newline
            for i in range(end, max(end - 150, start), -1):
                if text[i] == '\n':
                    boundary = i + 1
                    break
            
            # Fallback to sentence ending punctuation
            if boundary == -1:
                for i in range(end, max(end - 150, start), -1):
                    if text[i] in {'.', '?', '!'}:
                        boundary = i + 1
                        break
            
            if boundary != -1:
                end = boundary
                
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
            
        if end >= len(text):
            break
            
        start = end - chunk_overlap
        if start >= len(text) or chunk_size - chunk_overlap <= 0:
            break
            
    return chunks

class RAGEngine:
    def __init__(self):
        self.has_gemini = HAS_GEMINI

    def get_embeddings_gemini(self, texts: list[str]) -> list[list[float]]:
        """Generates embeddings for a list of strings using Google Gemini API."""
        if not self.has_gemini:
            raise ValueError("GEMINI_API_KEY is not set or google-generativeai is not configured.")
        
        import google.generativeai as genai
        embeddings = []
        # Process in batches of 100 to avoid API limitations
        batch_size = 100
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=batch,
                task_type="retrieval_document"
            )
            embeddings.extend(result['embedding'])
        return embeddings

    def get_query_embedding_gemini(self, query: str) -> list[float]:
        """Generates embedding for a query string using Google Gemini API."""
        if not self.has_gemini:
            raise ValueError("GEMINI_API_KEY is not set or google-generativeai is not configured.")
        
        import google.generativeai as genai
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=query,
            task_type="retrieval_query"
        )
        return result['embedding']

    def get_query_similarities_tfidf(self, query: str, chunks: list[str]) -> list[float]:
        """Computes cosine similarity between the query and chunks using TF-IDF."""
        if not chunks:
            return []
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(chunks)
            query_vector = vectorizer.transform([query])
            similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()
            return list(similarities)
        except Exception as e:
            print(f"[RAG] TF-IDF computation failed: {e}")
            # If TF-IDF fails (e.g. empty vocabulary), return uniform scores
            return [0.0] * len(chunks)

async def save_document(filename: str, text: str) -> str:
    """
    Chunks document, computes embeddings, and stores document & chunks into MongoDB.
    Returns the string representation of document's ObjectId.
    """
    db = get_database()
    chunks = chunk_text(text)
    if not chunks:
        raise ValueError("Document contains no readable text.")

    engine = RAGEngine()
    use_gemini = engine.has_gemini
    embeddings = []
    
    if use_gemini:
        try:
            embeddings = engine.get_embeddings_gemini(chunks)
        except Exception as e:
            print(f"[RAG] Gemini embeddings failed, falling back to TF-IDF metadata. Error: {e}")
            use_gemini = False

    # Insert document metadata
    doc_id = ObjectId()
    doc_record = {
        "_id": doc_id,
        "filename": filename,
        "title": filename.rsplit(".", 1)[0],
        "uploaded_at": datetime.utcnow(),
        "has_gemini_embeddings": use_gemini,
        "chunk_count": len(chunks)
    }
    await db.documents.insert_one(doc_record)

    # Prepare chunks
    chunk_records = []
    for idx, chunk in enumerate(chunks):
        chunk_record = {
            "document_id": doc_id,
            "chunk_index": idx,
            "text": chunk,
        }
        if use_gemini and idx < len(embeddings):
            chunk_record["embedding"] = embeddings[idx]
        chunk_records.append(chunk_record)

    if chunk_records:
        await db.document_chunks.insert_many(chunk_records)

    return str(doc_id)

async def retrieve_relevant_chunks(title_or_filename: str, query: str, top_k: int = 5) -> list[str]:
    """
    Finds document chunks by title or filename and returns top_k matching chunks for the query.
    """
    db = get_database()
    
    # Try finding the document by title or filename
    doc = await db.documents.find_one({
        "$or": [
            {"title": title_or_filename},
            {"filename": title_or_filename},
            {"filename": title_or_filename.lower()}
        ]
    })
    
    if not doc:
        # Fallback partial matching
        doc = await db.documents.find_one({
            "title": {"$regex": re.escape(title_or_filename), "$options": "i"}
        })
        
    if not doc:
        print(f"[RAG] No document found matching title/filename: {title_or_filename}")
        return []

    doc_id = doc["_id"]
    chunks_cursor = db.document_chunks.find({"document_id": doc_id}).sort("chunk_index", 1)
    chunk_records = await chunks_cursor.to_list(length=None)
    
    if not chunk_records:
        return []

    chunks = [r["text"] for r in chunk_records]
    engine = RAGEngine()

    # If Gemini embeddings were stored and Gemini is active, use dense similarity search
    if doc.get("has_gemini_embeddings") and engine.has_gemini:
        try:
            query_emb = engine.get_query_embedding_gemini(query)
            similarities = []
            for record in chunk_records:
                chunk_emb = record.get("embedding")
                if chunk_emb:
                    # Cosine Similarity
                    dot_val = np.dot(query_emb, chunk_emb)
                    norm_query = np.linalg.norm(query_emb)
                    norm_chunk = np.linalg.norm(chunk_emb)
                    sim = dot_val / (norm_query * norm_chunk) if (norm_query > 0 and norm_chunk > 0) else 0.0
                    similarities.append(sim)
                else:
                    similarities.append(0.0)
            
            top_indices = np.argsort(similarities)[-top_k:][::-1]
            return [chunks[idx] for idx in top_indices]
            
        except Exception as e:
            print(f"[RAG] Gemini cosine similarity calculation failed, falling back to TF-IDF. Error: {e}")

    # Fallback to TF-IDF Cosine Similarity
    similarities = engine.get_query_similarities_tfidf(query, chunks)
    if similarities:
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        return [chunks[idx] for idx in top_indices]
        
    return chunks[:top_k]

async def get_all_document_chunks(title_or_filename: str) -> list[str]:
    """Retrieves all chunks of a document sequentially."""
    db = get_database()
    doc = await db.documents.find_one({
        "$or": [
            {"title": title_or_filename},
            {"filename": title_or_filename},
            {"filename": title_or_filename.lower()}
        ]
    })
    if not doc:
        doc = await db.documents.find_one({
            "title": {"$regex": re.escape(title_or_filename), "$options": "i"}
        })
    if not doc:
        return []
        
    chunks_cursor = db.document_chunks.find({"document_id": doc["_id"]}).sort("chunk_index", 1)
    chunk_records = await chunks_cursor.to_list(length=None)
    return [r["text"] for r in chunk_records]
