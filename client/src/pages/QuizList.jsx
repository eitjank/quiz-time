import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/quizzes')
      .then((res) => res.json())
      .then((data) => setQuizzes(data))
      .catch((err) => console.error(err));
  }, []);

  const handleView = (quiz) => {
    navigate(`/quizzes/${quiz._id}/view`);
  };

  const handleEdit = (quiz) => {
    navigate(`/quizzes/${quiz._id}/edit`);
  };

  const handleDelete = async (quiz) => {
    try {
      await fetch(`http://localhost:3001/api/quizzes/${quiz._id}`, {
        method: 'DELETE',
      });
      setQuizzes(quizzes.filter((q) => q._id !== quiz._id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleHost = (quizId) => {
    // TODO: Implement host quiz functionality
  };

  return (
    <div>
      <h1>Quizzes</h1>
      <button onClick={() => navigate('/quizzes/create')}>Create Quiz</button>
      <ul>
        {quizzes &&
          quizzes.map((quiz, index) => (
            <li key={index}>
              <h2>{quiz.name}</h2>
              <p>Quiz id: {quiz._id}</p>
              <button onClick={() => handleHost(quiz._id)}>Host</button>
              <button onClick={() => handleView(quiz)}>View</button>
              <button onClick={() => handleEdit(quiz)}>Edit</button>
              <button onClick={() => handleDelete(quiz)}>Delete</button>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default QuizList;
