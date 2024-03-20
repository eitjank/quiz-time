import React from 'react';

function QuestionForm({ question, index, questions, setQuestions }) {
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
