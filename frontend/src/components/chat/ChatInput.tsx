// src/components/chat/ChatInput.tsx

import { useState, useRef } from "react";

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        borderTop: "1px solid rgba(167,139,250,0.1)",
        backdropFilter: "blur(20px)",
        background: "rgba(10,10,15,0.9)",
        padding: "16px 20px 20px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(167,139,250,0.2)",
            borderRadius: 16,
            padding: "10px 14px",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer... (Enter to send, Shift+Enter for newline)"
            rows={3}
            disabled={disabled}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#f1f0ff",
              fontSize: 14.5,
              lineHeight: 1.6,
              resize: "none",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              flexShrink: 0,
              background:
                input.trim() && !disabled
                  ? "linear-gradient(135deg, #7c3aed, #6366f1)"
                  : "rgba(255,255,255,0.07)",
              border: "none",
              cursor: input.trim() && !disabled ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: "white",
              transition: "all 0.2s",
            }}
          >
            ↑
          </button>
        </div>
        <p
          style={{
            fontSize: 11,
            color: "#374151",
            textAlign: "center",
            marginTop: 8,
          }}
        >
          Mock interview ends after 5 questions · Evaluation provided automatically
        </p>
      </div>
    </div>
  );
}