import React, { useState, useEffect, useCallback } from 'react';
import QuestionForm from './QuestionForm';

function QuizForm({ initialQuiz, onSubmit }) {
  const [name, setName] = useState(initialQuiz ? initialQuiz.name : '');
  const [description, setDescription] = useState(
    initialQuiz ? initialQuiz.description : ''
  );
  const [questions, setQuestions] = useState(
    initialQuiz
      ? initialQuiz.questions
      : [{ type: 'multipleChoice', question: '', options: [''] }]
  );

  useEffect(() => {
    if (initialQuiz) {
      setName(initialQuiz.name);
      setDescription(initialQuiz.description);
      setQuestions(initialQuiz.questions);
    }
  }, [initialQuiz]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, description, questions });
  };

  const handleQuestionChange = useCallback((index, newQuestion) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question, i) => (i === index ? newQuestion : question))
    );
  }, []);

  return (
    <div>
      <h1>{initialQuiz ? 'Edit Quiz' : 'Create Quiz'}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          Questions:
          <ul>
            {questions.map((question, index) => (
              <QuestionForm
                question={question}
                index={index}
                questions={questions}
                setQuestions={handleQuestionChange}
              />
            ))}
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuestions([
                  ...questions,
                  {
                    type: 'multipleChoice',
                    question: '',
                    options: [''],
                    answer: '',
                    timeLimit: 0,
                  },
                ]);
              }}
            >
              Add Question
            </button>
          </ul>
        </label>
        <button type="submit">
          {initialQuiz ? 'Update Quiz' : 'Create Quiz'}
        </button>
      </form>
    </div>
  );
}

export default QuizForm;
