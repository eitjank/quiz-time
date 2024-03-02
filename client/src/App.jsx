import './App.css';
import React from 'react';
import useQuiz from './hooks/useQuiz';
import JoinQuizForm from './components/JoinQuizForm';
import Quiz from './components/Quiz';

function App() {
  const { joined, currentQuestion, timer, joinQuiz, submitAnswer } = useQuiz();

  return (
    <div className="App">
      {!joined ? (
        <JoinQuizForm onJoinQuiz={joinQuiz} />
      ) : (
        <Quiz
          question={currentQuestion}
          timer={timer}
          onSubmitAnswer={submitAnswer}
        />
      )}
    </div>
  );
}

export default App;