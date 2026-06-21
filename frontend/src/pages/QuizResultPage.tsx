import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Difficulty = "easy" | "medium" | "hard";

export default function QuizResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state || {}) as {
    score?: number;
    total?: number;
    difficulty?: Difficulty;
    summary?: string;
    questions?: Array<{
      id: number;
      question: string;
      options: string[];
      answer: number;
      explanation: string;
    }>;
    selected?: Record<number, number>;
  };

  const score = state.score ?? 0;
  const total = state.total ?? state.questions?.length ?? 0;
  const difficulty = state.difficulty ?? "easy";
  const questions = state.questions ?? [];
  const selected = state.selected ?? {};

  const percent = useMemo(() => (total > 0 ? Math.round((score / total) * 100) : 0), [score, total]);

  if (!questions.length) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f2", padding: 32, fontFamily: "'DM Sans', sans-serif" }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", marginBottom: 10 }}>No quiz data</h2>
        <p style={{ color: "#6b6b85" }}>Please generate quiz again.</p>
        <button
          onClick={() => navigate("/quiz")}
          style={{
            marginTop: 18,
            padding: "12px 24px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg,#22c55e,#34d399)",
            color: "#0a0a0f",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Go to Quiz →
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0f",
          color: "#e8e8f2",
          padding: "52px 24px 100px",
          fontFamily: "'DM Sans', sans-serif",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <header style={{ textAlign: "center", marginBottom: 34 }}>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: 5,
                textTransform: "uppercase",
                color: "#4ade80",
                marginBottom: 18,
              }}
            >
              ⬡ Quiz Results
            </div>
            <h1
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(36px,5.5vw,62px)",
                fontWeight: 400,
                lineHeight: 1.08,
                letterSpacing: "-1px",
                color: "#f0f0f8",
                marginBottom: 10,
              }}
            >
              {score}/{total} Correct
            </h1>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#6b6b85", marginTop: 10 }}>
              Difficulty: {difficulty.toUpperCase()} · Score: {percent}%
            </p>
          </header>

          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 320 }}>
              <div style={{ background: "#13131e", border: "1px solid #1e1e2e", borderRadius: 20, padding: 26 }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#4ade80", marginBottom: 12 }}>
                  Review Questions
                </div>
                {questions.map((q, idx) => {
                  const chosen = selected[q.id];
                  const correct = q.answer;
                  const correctText = q.options[correct] ?? "";
                  const chosenText = typeof chosen === "number" ? q.options[chosen] ?? "" : "";
                  const isCorrect = typeof chosen === "number" && chosen === correct;

                  return (
                    <div
                      key={q.id}
                      style={{
                        border: "1px solid rgba(30,30,46,1)",
                        borderRadius: 14,
                        padding: 14,
                        marginBottom: 12,
                        background: isCorrect ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.06)",
                      }}
                    >
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#4ade80", marginBottom: 8 }}>
                        Q{idx + 1}
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#f0f0f8" }}>
                        {q.question}
                      </div>

                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: isCorrect ? "#34d399" : "#f87171" }}>
                        {isCorrect ? "Correct" : "Wrong"}
                      </div>

                      <div style={{ marginTop: 8, fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#a0a0b8", lineHeight: 1.6 }}>
                        Your answer:{" "}
                        <span style={{ color: isCorrect ? "#34d399" : "#fca5a5" }}>
                          {typeof chosen === "number" ? `${String.fromCharCode(65 + chosen)}. ${chosenText}` : "Not selected"}
                        </span>
                        <br />
                        Correct:{" "}
                        <span style={{ color: "#4ade80" }}>
                          {`${String.fromCharCode(65 + correct)}. ${correctText}`}
                        </span>
                      </div>

                      {q.explanation && (
                        <div
                          style={{
                            marginTop: 10,
                            fontSize: 12,
                            color: "#6b6b85",
                            fontFamily: "'Space Mono', monospace",
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.6,
                          }}
                        >
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ width: 340, maxWidth: "100%" }}>
              <div style={{ background: "#13131e", border: "1px solid #1e1e2e", borderRadius: 20, padding: 26 }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#4ade80", marginBottom: 12 }}>
                  Summary
                </div>

                {state.summary ? (
                  <details open>
                    <summary style={{ cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#6b6b85" }}>
                      View extracted summary
                    </summary>
                    <pre
                      style={{
                        marginTop: 10,
                        background: "#0e0e18",
                        border: "1px solid #1e1e2e",
                        borderRadius: 12,
                        padding: 16,
                        whiteSpace: "pre-wrap",
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 12,
                        color: "#a0a0b8",
                        lineHeight: 1.6,
                      }}
                    >
                      {state.summary}
                    </pre>
                  </details>
                ) : (
                  <div style={{ color: "#6b6b85", fontFamily: "'Space Mono', monospace", fontSize: 12 }}>
                    Summary not available.
                  </div>
                )}

                <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    onClick={() => navigate("/quiz")}
                    style={{
                      flex: 1,
                      padding: "13px 20px",
                      borderRadius: 12,
                      border: "none",
                      background: "linear-gradient(135deg,#22c55e,#34d399)",
                      color: "#0a0a0f",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Start Again →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

