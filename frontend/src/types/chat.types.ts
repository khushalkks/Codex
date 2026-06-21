export type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
  };
  
  export type ChatSession = {
    notebookId: string;
    messages: ChatMessage[];
  };