import './App.css';
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import useQuiz from './hooks/useQuiz';
import JoinQuizForm from './pages/JoinQuizForm';
import Quiz from './pages/Quiz';
import QuizList from './components/QuizList';
import QuizEdit from './pages/QuizEdit';
import QuizView from './pages/QuizView';
import QuizCreate from './pages/QuizCreate';

function App() {
  const { currentQuestion, timer, joinQuiz, submitAnswer } = useQuiz();

  return (
    <div className="App">
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/join">Join Quiz</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<QuizList onJoinQuiz={joinQuiz} />} />
        <Route
          path="/quizzes/:id"
          element={
            <Quiz
              question={currentQuestion}
              timer={timer}
              onSubmitAnswer={submitAnswer}
            />
          }
        />
        <Route path="/quizzes/:id/edit" element={<QuizEdit />} />
        <Route path="/quizzes/:id/view" element={<QuizView />} />
        <Route path="/quizzes/create" element={<QuizCreate />} />
        <Route path="/join" element={<JoinQuizForm onJoinQuiz={joinQuiz} />} />
      </Routes>
    </div>
  );
}

export default App;
