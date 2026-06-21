export type QuizOption = {
    id: string;
    text: string;
  };
  
  export type QuizQuestion = {
    id: string;
    question: string;
    options: QuizOption[];
    correctOptionId: string;
  };