// src/hooks/useInterview.ts

import { useState, useCallback } from "react";
import type { InterviewMessage, InterviewState, InterviewResponse } from "../types/interview";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useInterview() {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [state, setState] = useState<InterviewState>({
    isStarted: false,
    questionCount: 0,
    isFinished: false,
    isLoading: false,
    error: null,
  });

  const callAPI = useCallback(async (history: InterviewMessage[], userMsg?: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    const allMessages: InterviewMessage[] = userMsg
      ? [...history, { role: "user", content: userMsg, timestamp: new Date() }]
      : history;

    try {
      const res = await fetch(`${API_URL}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data: InterviewResponse = await res.json();

      const botMsg: InterviewMessage = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      const finalMessages = userMsg ? [...allMessages, botMsg] : [botMsg];
      setMessages(finalMessages);

      const isFinished =
        data.question_count >= 5 &&
        finalMessages.some((m) => m.content.toLowerCase().includes("overall score"));

      setState((s) => ({
        ...s,
        isLoading: false,
        questionCount: data.question_count,
        isFinished,
      }));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Backend se connect nahi ho paya.";
      setState((s) => ({ ...s, isLoading: false, error: message }));
    }
  }, []);

  const startInterview = useCallback(() => {
    setState((s) => ({ ...s, isStarted: true }));
    callAPI([]);
  }, [callAPI]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || state.isLoading) return;
      const userMsg: InterviewMessage = {
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      await callAPI(messages, text.trim());
    },
    [callAPI, messages, state.isLoading]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setState({
      isStarted: false,
      questionCount: 0,
      isFinished: false,
      isLoading: false,
      error: null,
    });
  }, []);

  return { messages, state, startInterview, sendMessage, reset };
}