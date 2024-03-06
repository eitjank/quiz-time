import './App.css';
import React from 'react';
import useQuiz from './hooks/useQuiz';
import JoinQuizForm from './components/JoinQuizForm';
import Quiz from './components/Quiz';
import QuizList from './components/QuizList';
import { Routes, Route, Link } from 'react-router-dom';

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
        <Route path="/" element={<QuizList />} />
        <Route
          path="/quiz/:id"
          element={
            <Quiz
              question={currentQuestion}
              timer={timer}
              onSubmitAnswer={submitAnswer}
            />
          }
        />
        <Route path="/join" element={<JoinQuizForm onJoinQuiz={joinQuiz} />} />
      </Routes>
    </div>
  );
}

export default App;
