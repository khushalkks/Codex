from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

documents = []
embeddings = None


def create_embeddings(text: str):
    global documents, embeddings

    # split text into chunks
    documents = text.split("\n")[:50]

    embeddings = model.encode(documents)


def retrieve(query: str, k=3):
    global documents, embeddings

    if embeddings is None:
        return []

    query_vec = model.encode([query])

    scores = cosine_similarity(query_vec, embeddings)[0]

    top_k_idx = np.argsort(scores)[-k:][::-1]

    return [documents[i] for i in top_k_idx]