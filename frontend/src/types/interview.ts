// src/types/interview.ts

export type MessageRole = "user" | "assistant";

export interface InterviewMessage {
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface InterviewRequest {
  messages: Pick<InterviewMessage, "role" | "content">[];
}

export interface InterviewResponse {
  reply: string;
  question_count: number;
}

export interface InterviewState {
  isStarted: boolean;
  questionCount: number;
  isFinished: boolean;
  isLoading: boolean;
  error: string | null;
}