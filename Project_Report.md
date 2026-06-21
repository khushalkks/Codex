# CortexCraft - Comprehensive Project Report

## 1. Executive Summary
**CortexCraft** is a next-generation AI-powered study and development ecosystem. It integrates advanced artificial intelligence with real-time collaboration tools to create a seamless environment for students and developers. The platform bridges the gap between passive learning and active creation by providing tools for summarization, testing, visualization, and collaborative coding.

---

## 2. Core Modules & Features

### 🧠 AI Study Suite
*   **AI Quiz Generator:** Automatically generates interactive quizzes from study materials to test user knowledge.
*   **Smart Flashcards:** Uses AI to extract key concepts and create memory-reinforcing flashcards.
*   **MindMap Generator:** Visualizes complex topics into hierarchical diagrams using Mermaid.js integration.
*   **AI Summarizer:** Distills long documents or notes into concise, actionable summaries.

### 💻 Development & Collaboration
*   **Collaborative IDE:** A real-time, synchronized code editor allowing multiple users to code together in the same environment.
*   **Interactive Whiteboard:** A shared canvas for brainstorming, diagramming, and visual collaboration with low-latency synchronization.
*   **AI Chatbot:** A persistent assistant that provides instant answers, code help, and concept explanations.

---

## 3. Technical Architecture

### Frontend (Modern SPA)
*   **Framework:** React 18 with TypeScript for type-safe development.
*   **Build Tool:** Vite for lightning-fast HMR and optimized production builds.
*   **Styling:** Custom CSS with Glassmorphism and modern design principles.
*   **Routing:** React Router DOM for seamless navigation.

### Backend (Scalable Microservices)
*   **Framework:** FastAPI (Python) for high-performance asynchronous API endpoints.
*   **Real-time Engine:** Socket.io for bidirectional communication (IDE and Whiteboard synchronization).
*   **AI Integration:** LangChain / Direct API integration with Google Gemini and OpenAI.

---

## 4. File Structure Overview

### Frontend (`/src`)
*   `pages/`: Contains main views (Dashboard, Quiz, MindMap, IDE, etc.)
*   `components/`: Reusable UI elements (Whiteboard, Sidebar, Chatbot UI).
*   `hooks/`: Custom React hooks for socket management and AI calls.

### Backend (`/backend`)
*   `main.py`: Entry point for the FastAPI application.
*   `socket_coding.py`: Handles real-time synchronization logic.
*   `ai/`: Logic for LLM interactions and prompt engineering.
*   `routes/`: API endpoint definitions.

---

## 5. Future Roadmap
1.  **RAG Integration:** Allow users to upload PDFs and query them using Vector Databases (ChromaDB/Pinecone).
2.  **Voice Interaction:** Enable voice commands and AI-driven speech-to-text for the chatbot.
3.  **Progress Tracking:** Implement a dashboard to track learning milestones and quiz performance.
4.  **Extension Ecosystem:** Allow developers to build custom modules for the CortexCraft platform.

---

**Author:** Khushal (AI & Full Stack Developer)
**Project Status:** Active Development
