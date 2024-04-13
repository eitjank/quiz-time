import React, { useEffect } from 'react';
import { QUESTIONS_ENDPOINT } from '../api/endpoints';

const QuestionBankSelector = ({ addQuestionToQuiz }) => {
  const [questionBank, setQuestionBank] = React.useState([]);
  useEffect(() => {
    fetch(`${QUESTIONS_ENDPOINT}`)
      .then((response) => response.json())
      .then((data) => setQuestionBank(data));
  }, []);

  return (
    <div>
      {questionBank.map((question, index) => (
        <div key={index}>
          <p>{question.question}</p>
          <button onClick={() => addQuestionToQuiz(question)}>
            Add to Quiz
          </button>
        </div>
      ))}
    </div>
  );
};

export default QuestionBankSelector;
