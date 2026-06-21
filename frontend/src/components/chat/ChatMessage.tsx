// src/components/chat/ChatMessage.tsx

import type { InterviewMessage } from "../../types/interview";

interface Props {
  message: InterviewMessage;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 16,
        animation: "fadeUp 0.3s ease",
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            flexShrink: 0,
            background: "linear-gradient(135deg, #7c3aed, #6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            marginRight: 10,
            marginTop: 4,
          }}
        >
          🎯
        </div>
      )}

      <div
        style={{
          maxWidth: "75%",
          padding: isUser ? "12px 18px" : "16px 20px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
          background: isUser
            ? "linear-gradient(135deg, #7c3aed, #6366f1)"
            : "rgba(255,255,255,0.05)",
          border: !isUser ? "1px solid rgba(167,139,250,0.15)" : "none",
          color: "#f1f0ff",
          fontSize: 14.5,
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {message.content}
        <div
          style={{
            fontSize: 11,
            color: isUser ? "rgba(255,255,255,0.5)" : "#4b5563",
            marginTop: 6,
            textAlign: "right",
          }}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}