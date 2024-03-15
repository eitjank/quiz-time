import { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:3001';

export function useQuizSession() {
  const [participants, setParticipants] = useState([]);
  const [socket, setSocket] = useState(null);
  const [results, setResults] = useState([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    setSocket(socket);

    socket.on('participantList', (data) => {
      console.log('Participant list:', data.participants);
      setParticipants(data.participants);
    });

    socket.on('participantLeft', (data) => {
      console.log(`Participant ${data.participantId} left the quiz`);
      setParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p.id !== data.participantId)
      );
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
      socket.off('quizFinished');
      socket.disconnect();
    };
  }, []);

  return {
    socket,
    results,
    finished,
    participants,
  };
}
