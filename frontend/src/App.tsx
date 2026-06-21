import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/dashboard";
import InterviewPage from "./pages/MockInterview";
import Resume from "./pages/Resume";
import Community from "./pages/Community";
import CodeCollab from "./pages/CodeCollab";
import QuizPage from "./pages/QuizPage";
import SummaryPage from "./pages/SummaryPage";
import MindMapGenerator from "./pages/MindMap";
import FlashcardGenerator from "./pages/FlashcardPage";
import ChatbotPage from "./pages/ChatbotPage";
import QuizResultPage from "./pages/QuizResultPage";
import StudyPlan from "./pages/StudyPlan";
import LoginPage from "./pages/LoginPage";
import WhiteboardPage from "./pages/whiteboard";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('user'));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('user'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Routes>
      {/* 
          Entry Point: Login Page 
          If already authenticated, redirect to /home
      */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />} 
      />
      
      {/* Home Page is now protected and at /home */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
      <Route path="/resume" element={<ProtectedRoute><Resume /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/code" element={<ProtectedRoute><CodeCollab /></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
      <Route path="/summary" element={<ProtectedRoute><SummaryPage /></ProtectedRoute>} />
      <Route path="/mindmap" element={<ProtectedRoute><MindMapGenerator /></ProtectedRoute>} />
      <Route path="/flashcards" element={<ProtectedRoute><FlashcardGenerator /></ProtectedRoute>} />
      <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage/></ProtectedRoute>} />
      <Route path="/quiz/result" element={<ProtectedRoute><QuizResultPage/></ProtectedRoute>} />
      <Route path="/study-plan" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
      <Route path="/whiteboard" element={<ProtectedRoute><WhiteboardPage /></ProtectedRoute>} />

      {/* Catch-all redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;