import React, { useEffect, useState } from 'react';

function QuizDetail({ quizId }) {
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    // Fetch the quiz from your backend here based on quizId and set it with setQuiz
  }, [quizId]);

  return (
    <div>
      {quiz && (
        <>
          <h2>{quiz.name}</h2>
          <p>{quiz.description}</p>
          {/* Add buttons here to start, edit, and delete the quiz */}
        </>
      )}
    </div>
  );
}

export default QuizDetail;