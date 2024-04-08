import React, { useState, useEffect, useCallback } from 'react';
import QuestionForm from './QuestionForm';
import { QUIZZES_ENDPOINT } from '../api/endpoints';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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
  const [visibility, setVisibility] = useState(
    initialQuiz ? initialQuiz.visibility : 'public'
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (initialQuiz) {
      setName(initialQuiz.name);
      setDescription(initialQuiz.description);
      setQuestions(initialQuiz.questions);
      setVisibility(initialQuiz.visibility);
    }
  }, [initialQuiz]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, description, visibility, questions });
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${QUIZZES_ENDPOINT}/${initialQuiz.id}/export`);
      console.log(res);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'quiz.json');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    }
  };

  const readFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e.target.error);
      reader.readAsText(file);
    });

  const handleImport = async (e) => {
    try {
      const file = e.target.files[0];
      const content = await readFile(file);
      const json = JSON.parse(content);
      const response = await fetch(`${QUIZZES_ENDPOINT}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(json),
      });
      // navigate to the imported quiz
      const data = await response.json();
      navigate(`/quizzes/${data.quizId}/edit`);

      toast.success('Quiz imported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to import quiz');
    }
  };

  const handleQuestionChange = useCallback((index, newQuestion) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question, i) => (i === index ? newQuestion : question))
    );
  }, []);

  return (
    <div>
      <h1>{initialQuiz ? 'Edit Quiz' : 'Create Quiz'}</h1>
      <button type="button" onClick={handleExport}>
        Export Quiz
      </button>
      <br />
      <label htmlFor="import">
        Import Quiz
        <input type="file" onChange={handleImport} />
      </label>
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
          Visibility:
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
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
