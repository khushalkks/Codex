import os
from groq import Groq
from dotenv import load_dotenv
from services.rag_service import chunk_text

load_dotenv()

def _summarize_chunk(client: Groq, chunk: str) -> str:
    prompt = (
        "Summarize the following section of a document. "
        "Provide 2-3 brief, highly informative bullet points of the key concepts.\n\n"
        f"Section Content:\n{chunk}"
    )
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=256,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"[Summarizer Chunk Error] {e}")
        return ""

def summarize_text(text: str) -> str:
    """
    Summarizes text using Groq LLM. Handles arbitrarily long text via a Map-Reduce approach.
    """
    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return "Error: GROQ_API_KEY missing in .env"

        client = Groq(api_key=api_key)
        chunks = chunk_text(text)
        if not chunks:
            return "Error: No text to summarize."

        # If document is small, summarize it in a single prompt
        if len(chunks) <= 6:
            full_text = "\n\n".join(chunks)
            prompt = (
                "You are a professional educational summarizer. "
                "Summarize the following document into a concise study summary. "
                "Maintain high accuracy and keep it structured with key points if necessary. "
                "Language: Professional English.\n\n"
                f"Document:\n{full_text}"
            )
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=1024,
            )
            return completion.choices[0].message.content.strip()

        # Map-Reduce for larger files:
        # Sample up to 5 evenly spaced chunks across the document
        num_chunks = len(chunks)
        sample_indices = [
            0,
            num_chunks // 4,
            num_chunks // 2,
            (3 * num_chunks) // 4,
            num_chunks - 1
        ]
        # Keep unique indices and preserve order
        sample_indices = sorted(list(set(sample_indices)))
        
        from concurrent.futures import ThreadPoolExecutor

        chunk_summaries = []
        with ThreadPoolExecutor(max_workers=len(sample_indices)) as executor:
            futures = {
                idx: executor.submit(_summarize_chunk, client, chunks[idx])
                for idx in sample_indices
            }
            for idx in sample_indices:
                summary = futures[idx].result()
                if summary:
                    chunk_summaries.append(f"Section {idx+1} Summary:\n{summary}")

        if not chunk_summaries:
            return text[:800] + "..."

        # Reduce step: Merge the summaries into a cohesive final study guide
        combined_summaries = "\n\n".join(chunk_summaries)
        reduce_prompt = (
            "You are a professional educational summarizer. "
            "Synthesize the following summaries of different sections of a document into a single cohesive, "
            "well-structured, and comprehensive final study summary. Use clear headings and bullet points. "
            "Language: Professional English.\n\n"
            f"Section Summaries:\n{combined_summaries}"
        )
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": reduce_prompt}],
            temperature=0.3,
            max_tokens=1024,
        )
        return completion.choices[0].message.content.strip()

    except Exception as e:
        print(f"[Summarizer Error] {e}")
        return text[:800] + "..."

