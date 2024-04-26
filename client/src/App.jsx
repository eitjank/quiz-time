import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import JoinQuizForm from './pages/JoinQuizForm';
import Quiz from './pages/Quiz';
import PublicQuizzes from './pages/PublicQuizzes';
import QuizEdit from './pages/QuizEdit';
import QuizView from './pages/QuizView';
import QuizCreate from './pages/QuizCreate';
import QuizHostSession from './pages/QuizHostSession';
import Navbar from './components/Navbar/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import { ToastContainer } from 'react-toastify';
import MyQuizzes from './pages/MyQuizzes';
import QuestionBank from './pages/QuestionBank';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound/NotFound';
import { useMantineColorScheme } from '@mantine/core';

function App() {
  const { colorScheme } = useMantineColorScheme();
  return (
    <div className="App">
      <ToastContainer
        position="bottom-right"
        theme={colorScheme === 'dark' ? 'dark' : 'light'}
        closeOnClick
      />
      <Navbar />
      <Routes>
        <Route path="/" element={<JoinQuizForm />} />
        <Route
          path="/myQuizzes"
          element={
            <ProtectedRoute>
              <MyQuizzes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questionBank"
          element={
            <ProtectedRoute>
              <QuestionBank />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/quizzes/:id" element={<Quiz />} />
        <Route path="/quizzes/:id/edit" element={<QuizEdit />} />
        <Route path="/quizzes/:id/view" element={<QuizView />} />
        <Route path="/quizzes/create" element={<QuizCreate />} />
        <Route path="/quizzes" element={<PublicQuizzes />} />
        <Route path="/quizSessions/:id" element={<QuizHostSession />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
