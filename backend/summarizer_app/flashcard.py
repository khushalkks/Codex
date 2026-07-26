import json
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def generate_flashcards(text: str, num_cards: int = 5):
    """
    Generates study flashcards using Groq (llama-3.3-70b-versatile).
    """
    snippet = (text or "").strip()
    if not snippet:
        return []

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return [{"question": "Error", "answer": "GROQ_API_KEY missing"}]

    # Chunk text and sample evenly across the document
    from services.rag_service import chunk_text
    chunks = chunk_text(snippet)
    if len(chunks) > 5:
        num_chunks = len(chunks)
        sample_indices = [
            0,
            num_chunks // 4,
            num_chunks // 2,
            (3 * num_chunks) // 4,
            num_chunks - 1
        ]
        sample_indices = sorted(list(set(sample_indices)))
        selected_chunks = [chunks[idx] for idx in sample_indices]
    else:
        selected_chunks = chunks
        
    flashcard_context = "\n\n---\n\n".join(selected_chunks)

    client = Groq(api_key=api_key)

    prompt = f"""Create {num_cards} study flashcards from the document content provided.
    
Each flashcard must have a concise 'question' and a detailed 'answer'.

Return ONLY a JSON array of objects.

Format:
[
  {{
    "question": "Question here?",
    "answer": "Detailed answer here."
  }}
]

Document Content:
{flashcard_context}
"""
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            response_format={"type": "json_object"} # Groq supports json_object, but for arrays we often just use text + parse or wrapped object
        )
        
        raw = completion.choices[0].message.content.strip()
        
        # Sometimes LLM wraps array in a key if using json_object
        data = json.loads(raw)
        if isinstance(data, list):
            return data[:num_cards]
        elif isinstance(data, dict):
            # Check for common keys like 'flashcards' or 'cards'
            for key in ['flashcards', 'cards', 'data', 'questions']:
                if key in data and isinstance(data[key], list):
                    return data[key][:num_cards]
        
        return []

    except Exception as e:
        print(f"[Flashcard Error] {e}")
        # Very basic fallback
        return [{"question": "Point 1", "answer": snippet[:200]}]