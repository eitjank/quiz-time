import './App.css';
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import JoinQuizForm from './pages/JoinQuizForm/JoinQuizForm';
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
import { AppShell, Burger, useMantineColorScheme } from '@mantine/core';
import QuestionEdit from './pages/QuestionEdit';
import { useDisclosure, useViewportSize } from '@mantine/hooks';
import './components/Navbar/Navbar.css';
import QuizStats from './pages/QuizStats';

function App() {
  const { colorScheme } = useMantineColorScheme();
  const background =
    colorScheme === 'dark'
      ? 'linear-gradient(45deg, #282c34 30%, #3c3f41 90%)'
      : 'linear-gradient(45deg, #87CEFA 30%, #B0E0E6 90%)';
  const { width } = useViewportSize();
  const [headerHeight, setHeaderHeight] = useState(56);
  const [opened, { toggle }] = useDisclosure();

  useEffect(() => {
    if (width > 576) {
      setHeaderHeight(56);
      if (opened) {
        toggle();
      }
    }
  }, [width, opened, toggle]);

  return (
    <div className="App">
      <ToastContainer
        position="bottom-right"
        theme={colorScheme === 'dark' ? 'dark' : 'light'}
        closeOnClick
      />
      <AppShell
        header={{ height: headerHeight }}
        padding="md"
        style={{ background }}
      >
        <AppShell.Header>
          <Burger
            opened={opened}
            onClick={() => {
              toggle();
              if (width <= 576) {
                setHeaderHeight(opened ? 56 : 269);
              }
            }}
            aria-label="Toggle navigation"
            hiddenFrom="xs"
            style={{ marginTop: 8 }}
          />
          {(width >= 576 || opened) && <Navbar />}
        </AppShell.Header>
        <AppShell.Main>
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
            <Route
              path="/question/:id/edit"
              element={
                <ProtectedRoute>
                  <QuestionEdit isEditing={true} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/question/create"
              element={
                <ProtectedRoute>
                  <QuestionEdit />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/quizzes/:id" element={<Quiz />} />
            <Route path="/quizzes/:id/edit" element={<QuizEdit />} />
            <Route path="/quizzes/:id/view" element={<QuizView />} />
            <Route path="/quizzes/:id/stats" element={<QuizStats />} />
            <Route path="/quizzes/create" element={<QuizCreate />} />
            <Route path="/quizzes" element={<PublicQuizzes />} />
            <Route path="/quizSessions/:id" element={<QuizHostSession />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppShell.Main>
      </AppShell>
    </div>
  );
}

export default App;
