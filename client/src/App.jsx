import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import JoinQuizForm from './pages/JoinQuizForm';
import Quiz from './pages/Quiz';
import Home from './pages/Home';
import QuizEdit from './pages/QuizEdit';
import QuizView from './pages/QuizView';
import QuizCreate from './pages/QuizCreate';
import QuizHostSession from './pages/QuizHostSession';
import Navbar from './components/Navbar/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/quizzes/:id" element={<Quiz />} />
        <Route path="/quizzes/:id/edit" element={<QuizEdit />} />
        <Route path="/quizzes/:id/view" element={<QuizView />} />
        <Route path="/quizzes/create" element={<QuizCreate />} />
        <Route path="/join" element={<JoinQuizForm />} />
        <Route path="/quizSessions/:id" element={<QuizHostSession />} />
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </div>
  );
}

export default App;
