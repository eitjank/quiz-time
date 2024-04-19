import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard/Leaderboard';
import { useQuizSession } from '../hooks/useQuizSession';
import {
  Button,
  Group,
  Switch,
  Space,
  Container,
  Stack,
  Text,
  Paper,
} from '@mantine/core';
import ParticipantList from '../components/ParticipantList';
import CurrentQuestion from '../components/CurrentQuestion';

const QuizHostSession = () => {
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [timer, setTimer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [started, setStarted] = useState(false);
  const { id } = useParams();
  const { socket, results, finished, participants } = useQuizSession();
  const [isManualControl, setIsManualControl] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(100);

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
    socket.on('joinedQuiz', (data) => {
      if (data.success) {
        console.log('Joined quiz');
      } else {
        alert(data.message);
      }
    });

    socket.on('receiveQuestion', (question) => {
      setCurrentQuestion(question);
      setTimer(question.timeLimit);
    });

    socket.on('timeUpdate', (timeRemaining) => {
      setTimer(timeRemaining);
    });

    socket.emit('hostJoinQuiz', { quizSessionId: id });

    return () => {
      // Clean up the socket connection
      socket.off('joinedQuiz');
      socket.off('receiveQuestion');
      socket.off('timeUpdate');
    };
  }, [id, socket]);

  useEffect(() => {
    if (timer === 0) {
      setShowAnswer(true);
    } else {
      setShowAnswer(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const startQuiz = () => {
    socket.emit('startQuiz', { quizSessionId: id, isManualControl });
    setStarted(true);
  };

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'multipleChoice':
        return (
          <Stack gap="sm">
            {question.options.map((option, index) => (
              <Paper
                key={index}
                style={{ backgroundColor: '#dcdcdc', padding: '20px' }}
                shadow="md"
              >
                <Text>{option}</Text>
              </Paper>
            ))}
          </Stack>
        );
      case 'trueFalse':
        return (
          <Stack gap="sm">
            <Paper
              style={{ backgroundColor: '#dcdcdc', padding: '20px' }}
              shadow="md"
            >
              <Text>True</Text>
            </Paper>
            <Paper
              style={{ backgroundColor: '#dcdcdc', padding: '20px' }}
              shadow="md"
            >
              <Text>False</Text>
            </Paper>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h1>Quiz Host Session</h1>
      <h2>Quiz Session ID: {id}</h2>
      {!finished ? (
        <>
          {!started ? (
            <>
              <Group justify="center">
                <Switch
                  label="Manual Control"
                  checked={isManualControl}
                  onChange={() => setIsManualControl(!isManualControl)}
                />
              </Group>
              <Space h="lg" />
              <Button onClick={startQuiz}>Start Quiz</Button>
              <h2>Participants:</h2>
              <Container size="lg">
                <ParticipantList participants={participants} />
              </Container>
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
              {isManualControl && (
                <>
                  {showAnswer ? (
                    <Button
                      onClick={() => {
                        socket.emit('nextQuestion', { quizSessionId: id });
                        setShowAnswer(false);
                      }}
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        socket.emit('skipQuestion', { quizSessionId: id })
                      }
                    >
                      Skip Question
                    </Button>
                  )}
                </>
              )}
              <Space h="lg" />
              <Container size="md">
                <CurrentQuestion
                  currentQuestion={currentQuestion}
                  renderQuestionInput={renderQuestionInput}
                  showAnswer={showAnswer}
                />
              </Container>
            </div>
          )}
        </>
      ) : (
        <Leaderboard results={results} />
      )}
    </div>
  );
};

export default QuizHostSession;
