import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function QuizEdit() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3001/api/quizzes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setName(data.name);
        setDescription(data.description);
        setQuestions(data.questions);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:3001/api/quizzes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, questions }),
      });
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  if (!questions) return <div>Loading...</div>;

  return (
    <div>
      <h1>Edit Quiz</h1>
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
              <li key={index}>
                <p>Type:</p>
                <select
                  value={question.type}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[index].type = e.target.value;
                    setQuestions(newQuestions);
                  }}
                >
                  <option value="multipleChoice">Multiple Choice</option>
                  <option value="openEnded">Open Ended</option>
                  <option value="trueFalse">True/False</option>
                </select>
                <p>Question:</p>
                <input
                  type="text"
                  value={questions[index].question}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[index].text = e.target.value;
                    setQuestions(newQuestions);
                  }}
                />
                {question.type === 'multipleChoice' && (
                  <>
                    <p>Options:</p>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex}>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newQuestions = [...questions];
                            newQuestions[index].options[optionIndex] =
                              e.target.value;
                            setQuestions(newQuestions);
                          }}
                          placeholder={option}
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const newQuestions = [...questions];
                            newQuestions[index].options.splice(optionIndex, 1);
                            setQuestions(newQuestions);
                          }}
                        >
                          Remove Option
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const newQuestions = [...questions];
                        newQuestions[index].options.push('');
                        setQuestions(newQuestions);
                      }}
                    >
                      Add Option
                    </button>
                  </>
                )}
                <p>Answer:</p>
                <input
                  type="text"
                  value={question.answer}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[index].answer = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  placeholder={questions[index].answer}
                />
                <p>timeLimit (seconds):</p>
                <input
                  type="number"
                  value={question.timeLimit}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[index].timeLimit = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  placeholder={questions[index].timeLimit}
                />
                <br />
                <br />
              </li>
            ))}
          </ul>
        </label>
        <button type="submit">Update Quiz</button>
      </form>
    </div>
  );
}

export default QuizEdit;
