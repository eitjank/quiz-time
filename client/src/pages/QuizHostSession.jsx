import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:3001';

const QuizHostSession = () => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [timer, setTimer] = useState(null);
  const [socket, setSocket] = useState(null);
  const [started, setStarted] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    setSocket(socket);

    socket.on('receiveQuestion', (question) => {
      setCurrentQuestion(question);
      setTimer(question.timeLimit);
    });

    socket.on('timeUpdate', (timeRemaining) => {
      setTimer(timeRemaining);
    });

    socket.on('joinedQuiz', (data) => {
      if (data.success) {
        console.log('Joined quiz');
      } else {
        alert(data.message);
      }
    });

    socket.on('participantJoined', (data) => {
      console.log(`Participant ${data.participantId} joined the quiz`);
      setParticipants((prevParticipants) => [
        ...prevParticipants,
        { id: data.participantId, name: data.participantId },
      ]);
    });

    socket.on('quizFinished', (data) => {
      console.log('Quiz finished');
      console.log(data);
    });

    socket.emit('hostJoinQuiz', { quizSessionId: id });

    return () => {
      // Clean up the socket connection
      socket.off('receiveQuestion');
      socket.off('joinedQuiz');
      socket.off('timeUpdate');
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (timer === 0) {
      setShowAnswer(true);
    } else {
      setShowAnswer(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const startQuiz = () => {
    socket.emit('startQuiz', { quizSessionId: id });
    setStarted(true);
  };

  const progressBarWidth =
    currentQuestion.timeLimit !== 0
      ? ((timer - 1) / (currentQuestion.timeLimit - 1)) * 100
      : 0;

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'multipleChoice':
        return question.options.map((option, index) => (
          <ul key={index}>
            <li htmlFor={`option-${index}`}>{option}</li>
          </ul>
        ));
      case 'trueFalse':
        return ['True', 'False'].map((option, index) => (
          <ul key={index}>
            <li htmlFor={`trueFalse-${index}`}>{option}</li>
          </ul>
        ));
      default:
        return null;
    }
  };

  return (
    <div>
      <h1>Quiz Host Session</h1>
      <h2>Quiz Session ID: {id}</h2>
      {!started ? (
        <>
          <button onClick={startQuiz}>Start Quiz</button>
          <h2>Participants:</h2>
          <ul>
            {participants.map((participant) => (
              <li key={participant.id}>{participant.name}</li>
            ))}
          </ul>
        </>
      ) : (
        <div>
          <h1>Quiz Time!</h1>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${progressBarWidth}%` }}
            ></div>
          </div>
          <p>Time left: {timer} seconds</p>
          <p>{currentQuestion.question}</p>
          {renderQuestionInput(currentQuestion)}
          {showAnswer && <p>The correct answer is: {currentQuestion.answer}</p>}
        </div>
      )}
    </div>
  );
};

export default QuizHostSession;
