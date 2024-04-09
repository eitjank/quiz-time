import React, { useEffect, useState } from 'react';
import { QUESTIONS_ENDPOINT } from '../api/endpoints';
import QuestionForm from '../components/QuestionForm';

function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [index, setIndex] = useState(null);

  useEffect(() => {
    fetch(`${QUESTIONS_ENDPOINT}`)
      .then((response) => response.json())
      .then((data) => setQuestions(data))
      .catch((error) => console.error(error));
  }, []);

  const handleEdit = (question, index) => {
    setEditingQuestion(question);
    setIndex(index);
  };

  const handleDelete = (question) => {
    fetch(`${QUESTIONS_ENDPOINT}/${question._id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete question');
        }
        return response.json();
      })
      .then((data) =>
        setQuestions(questions.filter((q) => q._id !== question._id))
      )
      .catch((error) => console.error(error));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${QUESTIONS_ENDPOINT}/${editingQuestion._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editingQuestion),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update question');
        }
        return response.json();
      })
      .then((data) => {
        const newQuestions = [...questions];
        newQuestions[index] = data;
        setQuestions(newQuestions);
        setEditingQuestion(null);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div>
      {editingQuestion ? (
        <form onSubmit={handleSubmit}>
          <QuestionForm
            question={editingQuestion}
            questions={questions}
            setQuestions={setQuestions}
            index={index}
          />
          <button onClick={() => setEditingQuestion(null)}>Cancel</button>
          <button type="submit">Save</button>
        </form>
      ) : (
        <>
          {questions.map((question, index) => (
            <div key={question._id}>
              <p>{question.question}</p>
              <button onClick={() => handleEdit(question, index)}>Edit</button>
              <button onClick={() => handleDelete(question)}>Delete</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default QuestionBank;
