// src/types/resume.types.ts

export interface AnalysisData {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  matched_skills: string[];
  missing_skills: string[];
  fileName?: string;
}
