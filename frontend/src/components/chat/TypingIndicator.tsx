// src/components/chat/TypingIndicator.tsx

export default function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
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
          animation: "pulse 1.5s infinite",
        }}
      >
        🎯
      </div>
      <div
        style={{
          display: "flex",
          gap: 5,
          alignItems: "center",
          padding: "14px 18px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(167,139,250,0.12)",
          borderRadius: "4px 16px 16px 16px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#a78bfa",
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}