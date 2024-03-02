import { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:3001';
const socket = socketIOClient(ENDPOINT);

function useQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [timer, setTimer] = useState(0);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    socket.on('receiveQuestion', (question) => {
      setCurrentQuestion(question);
      setTimer(question.timeLimit);
    });

    socket.on('joinedQuiz', (data) => {
      if (data.success) {
        setJoined(true);
        socket.emit('requestQuestion', { quizId: data.quizId });
      } else {
        setJoined(false);
        alert(data.message);
      }
    });

    socket.on('timeUpdate', (timeRemaining) => {
      setTimer(timeRemaining);
    });

    return () => {
      socket.off('receiveQuestion');
      socket.off('joinedQuiz');
    };
  }, []);

  const joinQuiz = (quizId) => {
    socket.emit('joinQuiz', { quizId });
  };

  const submitAnswer = (answer) => {
    socket.emit('submitAnswer', { answer });
  };

  return { joined, currentQuestion, timer, joinQuiz, submitAnswer };
}

export default useQuiz;