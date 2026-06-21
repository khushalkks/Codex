# CodexCraft 🚀

<p align="left">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Vite-B736FF?style=for-the-badge&logo=vite&logoColor=FFD62B" alt="Vite" />
</p>

> A State-of-the-Art AI-Powered Collaborative Learning & Coding Suite.

CodexCraft is a premium, feature-rich full-stack application that integrates cutting-edge **Multi-Agent AI cognitive tools** with **real-time multiplayer collaboration** for developers and students. 

Whether you want to visualize complex subjects through interactive mind maps, optimize study plans using Machine Learning models, simulate code interviews, or write code and sketch diagrams collaboratively with peers in real-time, CodexCraft handles it all.

---

## ✨ Key Features

### 🧠 Multi-Agent AI Suite
* **AI Chatbot**: Intelligent chatbot powered by Ollama models (with automatic Groq fallback) including full conversation history.
* **Document Summarizer**: Instant, highly accurate summaries from uploaded PDF, DOCX, and TXT files using advanced parsing.
* **Interactive Mindmaps**: Automatic concept hierarchy mapping visualized beautifully using Mermaid.js.
* **ML-Powered Study Planner**: Generates study schedules using a local Machine Learning `LinearRegression` model to predict task difficulty and time allocations, paired with custom tips from Groq `llama-3.3-70b-versatile`.
* **AI Quiz & Flashcards Generator**: Upload a document to instantly generate interactive multiple-choice quizzes and active-recall flashcards.
* **AI Interview Simulator**: Interactive, custom voice/text mock interview trainer powered by Groq's async completions.

### 👥 Real-Time Collaboration (Multiplayer)
* **Collaborative Code Editor**: Multiplayer real-time code sandbox featuring Monaco Editor (VS Code core) synchronized via Socket.IO.
* **Collaborative Whiteboard**: Seamless multiplayer vector drawing canvas with real-time cursor tracking and shape drawing.

### 💬 Community Hub
* **Discussion Forums**: Public board to share study posts, like content, comment, and engage with peers.
* **Secure Authentication**: End-to-end user signup and login secured using PyJWT and bcrypt password hashing.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, TailwindCSS / Custom HSL CSS, Framer Motion (micro-animations), React Router v6 |
| **Backend** | FastAPI (Python 3.14), Uvicorn, Socket.IO AsyncServer, PyJWT, bcrypt, Motor (Async MongoDB Driver) |
| **Machine Learning / AI** | Scikit-Learn (Linear Regression), Numpy, Groq SDK, Ollama, PyMuPDF, python-docx, PyPDF2 |
| **Database** | MongoDB Atlas (Cloud Cluster) |

---

## 📁 Project Structure

```text
my_project/
├── backend/                  # Python FastAPI Backend
│   ├── ai/                   # AI & LLM integration modules (Groq, Gemini)
│   ├── chatbot/              # Local / Cloud LLM orchestration
│   ├── config/               # Database configurations (MongoDB, Motor)
│   ├── models/               # Pydantic schemas and database models
│   ├── routes/               # API routes (Auth, Coding, Whiteboard, Flashcards, Summary, etc.)
│   ├── services/             # Core business logic services
│   ├── summarizer_app/       # Mindmap, Quiz, Study Plan, and Interview services
│   ├── main.py               # Application entrypoint (FastAPI + Socket.IO)
│   ├── socket_coding.py      # Real-time WebSocket handlers
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React TypeScript Frontend
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, ChatInput, etc.)
│   │   ├── pages/            # Core views (Home, Login, Dashboard, Whiteboard, Coding, etc.)
│   │   ├── types/            # TypeScript type definitions
│   │   ├── config.ts         # Centralized API and WebSocket URL routing
│   │   └── main.tsx          # React application root
│   ├── vercel.json           # Vercel SPA routing redirects configuration
│   └── package.json          # Node dependencies
```

---

## 🚀 Local Development Setup

### Prerequisite
* Python 3.10+ installed
* Node.js v18+ installed
* MongoDB local instance or MongoDB Atlas Cluster URL

### 1. Backend Setup
Navigate to the `backend/` directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install backend dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder and add:
```env
MONGODB_URL=mongodb+srv://your_username:your_password@cluster.mongodb.net/?retryWrites=true&w=majority
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_super_secret_jwt_key
PORT=8000
```

Start the FastAPI backend server:
```bash
uvicorn main:app --reload
```

---

### 2. Frontend Setup
Open a new terminal and navigate to the `frontend/` directory:
```bash
cd frontend
```

Install npm dependencies:
```bash
npm install
```

Create a `.env` file in the `frontend/` folder for local environment variables:
```env
VITE_API_URL=http://localhost:8000
```

Start the Vite development server:
```bash
npm run dev
```

---

## ☁️ Deployment Configuration

### Backend (Render)
1. Set the **Root Directory** to `backend`.
2. Use **Build Command**: `pip install -r requirements.txt`.
3. Use **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
4. Inject environment variables: `MONGODB_URL`, `GROQ_API_KEY`, and `JWT_SECRET`.

### Frontend (Vercel)
1. Import repository and set **Root Directory** to `frontend`.
2. Vercel automatically selects the **Vite** framework preset.
3. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-render-url.onrender.com`
4. The custom `vercel.json` will automatically route any sub-paths to `index.html` to prevent 404 errors on page refresh.

---

## 👨‍💻 Author
**Khushal**
*AI & Full Stack Developer*
