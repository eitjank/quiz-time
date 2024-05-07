import { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import { ENDPOINT } from '../api/endpoints';

export function useQuizSession() {
  const [participants, setParticipants] = useState([]);
  const [socket, setSocket] = useState(null);
  const [results, setResults] = useState([]);
  const [finished, setFinished] = useState(false);
  const [scoreByTime, setScoreByTime] = useState(false);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    setSocket(socket);

    socket.on('participantList', (data) => {
      setParticipants(data.participants);
    });

    socket.on('participantLeft', (data) => {
      setParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p.id !== data.participantId)
      );
    });

    socket.on('quizStarted', (data) => {
      setScoreByTime(data.scoreByTime);
    });

    socket.on('quizFinished', (data) => {
      setFinished(true);
      setResults(data.participants);
    });

    return () => {
      // Clean up the socket connection
      socket.off('receiveQuestion');
      socket.off('timeUpdate');
      socket.off('participantList');
      socket.off('participantLeft');
      socket.off('quizStarted');
      socket.off('quizFinished');
      socket.disconnect();
    };
  }, []);

  return {
    socket,
    results,
    finished,
    participants,
    scoreByTime,
  };
}
