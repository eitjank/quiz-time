import React from 'react';
import { BASE_URL, FILE_UPLOAD_ENDPOINT } from '../api/endpoints';

function QuestionForm({ question, index, questions, setQuestions }) {
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // If there's an old image, delete it
    console.log(questions[index].image);
    if (questions[index].image) {
      await fetch(`${BASE_URL}/uploads/${questions[index].image}`, {
        method: 'DELETE',
      });
    }

    // Upload the new image
    try {
      const response = await fetch(FILE_UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      const newQuestions = [...questions];
      newQuestions[index].image = data.filePath;
      setQuestions(newQuestions);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <li key={index}>
      <p>Type:</p>
      <select
        data-testid="question-type-select"
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
        data-testid="question-input"
        type="text"
        value={questions[index].question}
        onChange={(e) => {
          const newQuestions = [...questions];
          newQuestions[index].question = e.target.value;
          setQuestions(newQuestions);
        }}
      />
      <br />
      <label>
        Image:
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </label>
      <br />
      {question.image && (
        <img src={`${BASE_URL}/${question.image}`} alt="Question" />
      )}
      {question.type === 'multipleChoice' && (
        <>
          <p>Options:</p>
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex}>
              <input
                data-testid="option-multiple-choice-input"
                type="text"
                value={option}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[index].options[optionIndex] = e.target.value;
                  setQuestions(newQuestions);
                }}
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
        data-testid="answer-input"
        type="text"
        value={question.answer}
        onChange={(e) => {
          const newQuestions = [...questions];
          newQuestions[index].answer = e.target.value;
          setQuestions(newQuestions);
        }}
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
      />
      <br />
      <br />
      <button
        onClick={(e) => {
          e.preventDefault();
          const newQuestions = [...questions];
          newQuestions.splice(index, 1);
          setQuestions(newQuestions);
        }}
      >
        Remove Question
      </button>
      <br />
      <br />
    </li>
  );
}

export default QuestionForm;
