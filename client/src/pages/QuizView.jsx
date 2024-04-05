import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BASE_URL, QUIZZES_ENDPOINT } from '../api/endpoints';

function QuizView() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    fetch(`${QUIZZES_ENDPOINT}/${id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setQuiz(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!quiz) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{quiz.name}</h1>
      <p>{quiz.description}</p>
      <h2>Questions:</h2>
      {quiz.questions.map((question, index) => (
        <div key={index}>
          <h3>{question.question}</h3>
          {question.image && (
            <img src={`${BASE_URL}/${question.image}`} alt="Question" />
          )}
          <h4>Type: {question.type}</h4>
          {question.type === 'multipleChoice' && <h4>Options</h4>}
          <ul>
            {question.options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
          {question.answer && <p>Answer: {question.answer}</p>}
        </div>
      ))}
    </div>
  );
}

export default QuizView;
