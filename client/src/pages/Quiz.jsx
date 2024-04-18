import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard/Leaderboard';
import { useQuizSession } from '../hooks/useQuizSession';
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from 'unique-names-generator';
import { useDisclosure } from '@mantine/hooks';
import NameModal from '../components/NameModal';
import { Container, Radio, TextInput, Stack, Group } from '@mantine/core';
import ParticipantList from '../components/ParticipantList';
import CurrentQuestion from '../components/CurrentQuestion';

function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [timer, setTimer] = useState(null);
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [joined, setJoined] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, results, finished, participants } = useQuizSession(id);
  const [progressBarWidth, setProgressBarWidth] = useState(100);
  const [name, setName] = useState('');
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    if (currentQuestion.timeLimit !== 0) {
      setProgressBarWidth(
        ((timer - 1) / (currentQuestion.timeLimit - 1)) * 100
      );
    } else {
      setProgressBarWidth(0);
    }
    if (timer === 0) {
      setProgressBarWidth(0);
    }
  }, [timer, currentQuestion.timeLimit]);

  useEffect(() => {
    if (!socket) return;
    const generatedName = generateRandomName();
    setName(generatedName);
    socket.emit('joinQuiz', { quizSessionId: id, name: generatedName });

    socket.on('receiveQuestion', (question) => {
      setCurrentQuestion(question);
      setTimer(question.timeLimit);
      setAnswer('');
    });

    socket.on('timeUpdate', (timeRemaining) => {
      setTimer(timeRemaining);
    });

    socket.on('joinedQuiz', (data) => {
      if (data.success) {
        setJoined(true);
      } else {
        setJoined(false);
        alert(data.message);
        navigate('/join');
      }
    });

    return () => {
      // Clean up the socket connection
      socket.off('joinedQuiz');
      socket.off('receiveQuestion');
      socket.off('timeUpdate');
    };
  }, [id, navigate, socket]);

  useEffect(() => {
    if (!socket || !name || !joined) return;
    open();
  }, [id, name, socket, joined, open]);

  useEffect(() => {
    if (timer === 0) {
      setShowAnswer(true);
      setIsCorrect(answer === currentQuestion.answer);
      socket.emit('submitAnswer', { quizSessionId: id, answer });
    } else {
      setShowAnswer(false);
      setIsCorrect(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const generateRandomName = () => {
    return uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      style: 'capital',
      separator: ' ',
    });
  };

  const handleNameSubmit = (event) => {
    event.preventDefault();
    if (socket) socket.emit('changeName', { quizSessionId: id, name });
    close();
  };

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'multipleChoice':
        return (
          <Group justify="center">
            <Stack gap="sm">
              {question.options.map((option, index) => (
                <Radio
                  key={index}
                  id={`option-${index}`}
                  name="quizOption"
                  value={option}
                  label={option}
                  checked={answer === option}
                  disabled={showAnswer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              ))}
            </Stack>
          </Group>
        );
      case 'openEnded':
        return (
          <TextInput
            type="text"
            value={answer}
            disabled={showAnswer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        );
      case 'trueFalse':
        return (
          <Group justify="center">
            <Stack gap="sm">
              {['True', 'False'].map((option, index) => (
                <Radio
                  key={index}
                  id={`trueFalse-${index}`}
                  name="trueFalseOption"
                  value={option}
                  label={option}
                  checked={answer.toLowerCase() === option.toLowerCase()}
                  disabled={showAnswer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              ))}
            </Stack>
          </Group>
        );
      default:
        return null;
    }
  };

  if (joined === false) {
    return <p>Joining quiz...</p>;
  }

  return (
    <>
      <NameModal
        {...{
          opened,
          close,
          name,
          setName,
          handleNameSubmit,
          generateRandomName,
        }}
      />
      <h1>Quiz Time!</h1>
      {!finished ? (
        <>
          {!currentQuestion.question ? (
            <>
              <h2>Participants:</h2>
              <Container size="lg">
                <ParticipantList participants={participants} />
              </Container>
            </>
          ) : (
            <>
              {currentQuestion.question && (
                <>
                  <div className="progress-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${progressBarWidth}%` }}
                    ></div>
                  </div>
                  <p>Time left: {timer} seconds</p>
                </>
              )}
              <Container size="md">
                <CurrentQuestion
                  currentQuestion={currentQuestion}
                  renderQuestionInput={renderQuestionInput}
                  showAnswer={showAnswer}
                />
                {showAnswer &&
                  isCorrect !== null &&
                  (isCorrect ? (
                    <p>Your answer is correct!</p>
                  ) : (
                    <p>Your answer is incorrect.</p>
                  ))}
              </Container>
            </>
          )}
        </>
      ) : (
        <Leaderboard results={results} />
      )}
    </>
  );
}

export default Quiz;
