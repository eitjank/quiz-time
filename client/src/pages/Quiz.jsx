import React, { useEffect, useState } from 'react';

function Quiz({ question, timer, onSubmitAnswer }) {
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const progressBarWidth =
    question.timeLimit !== 0
      ? ((timer - 1) / (question.timeLimit - 1)) * 100
      : 0;

  useEffect(() => {
    if (timer === 0) {
      setShowAnswer(true);
      setIsCorrect(answer === question.answer);
      onSubmitAnswer(answer);
      setAnswer('');
    } else {
      setShowAnswer(false);
      setIsCorrect(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'multipleChoice':
        return question.options.map((option, index) => (
          <div key={index}>
            <input
              type="radio"
              id={`option-${index}`}
              name="quizOption"
              value={option}
              checked={answer === option}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <label htmlFor={`option-${index}`}>{option}</label>
          </div>
        ));
      case 'openEnded':
        return (
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        );
      case 'trueFalse':
        return ['True', 'False'].map((option, index) => (
          <div key={index}>
            <input
              type="radio"
              id={`trueFalse-${index}`}
              name="trueFalseOption"
              value={option}
              checked={answer.toLowerCase() === option.toLowerCase()}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <label htmlFor={`trueFalse-${index}`}>{option}</label>
          </div>
        ));
      default:
        return null;
    }
  };

  return (
    <>
      <h1>Quiz Time!</h1>
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{ width: `${progressBarWidth}%` }}
        ></div>
      </div>
      <p>Time left: {timer} seconds</p>
      <p>{question.question}</p>
      {renderQuestionInput(question)}
      {showAnswer && <p>The correct answer is: {question.answer}</p>}
      {showAnswer &&
        isCorrect !== null &&
        (isCorrect ? (
          <p>Your answer is correct!</p>
        ) : (
          <p>Your answer is incorrect.</p>
        ))}
    </>
  );
}

export default Quiz;
