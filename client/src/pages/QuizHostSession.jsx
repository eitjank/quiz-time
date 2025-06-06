import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard/Leaderboard';
import { useQuizSession } from '../hooks/useQuizSession';
import { Button, Group, Switch, Space, Container, Title } from '@mantine/core';
import ParticipantList from '../components/ParticipantList/ParticipantList';
import CurrentQuestion from '../components/CurrentQuestion';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import OptionsList from '../components/OptionsList/OptionsList';

const QuizHostSession = () => {
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [timer, setTimer] = useState(null);
  const [currentCorrectAnswer, setCurrentCorrectAnswer] = useState(null);
  const [started, setStarted] = useState(false);
  const { id } = useParams();
  const { socket, results, finished, participants } = useQuizSession();
  const [isManualControl, setIsManualControl] = useState(false);
  const [scoreByTime, setScoreByTime] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(100);
  const navigate = useNavigate();

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
      if (!data.success) {
        toast.error(data.message);
        navigate('/');
      }
    });

    socket.on('receiveQuestion', (question) => {
      setCurrentQuestion(question);
      setCurrentCorrectAnswer(null);
      setTimer(question.timeLimit);

      const intervalId = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(intervalId);
            return 0;
          } else {
            return prevTimer - 1;
          }
        });
      }, 1000);
    });

    socket.on('correctAnswer', ({ correctAnswer }) => {
      setCurrentCorrectAnswer(correctAnswer);
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
      socket.off('correctAnswer');
    };
  }, [id, socket, navigate]);

  const startQuiz = () => {
    if (!socket) return;
    socket.emit('startQuiz', {
      quizSessionId: id,
      isManualControl,
      scoreByTime,
    });
    setStarted(true);
  };

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'multipleChoice':
        return <OptionsList options={question.options} />;
      case 'trueFalse':
        return <OptionsList options={['True', 'False']} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Container size="lg">
        <Title order={2}>Quiz Session ID: {id}</Title>
        <Space h="lg" />
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
                  <Switch
                    label="Score By Time"
                    checked={scoreByTime}
                    onChange={() => setScoreByTime(!scoreByTime)}
                  />
                </Group>
                <Space h="lg" />
                <Button onClick={startQuiz}>Start Quiz</Button>
                <Space h="lg" />
                <Title order={2}>Participants:</Title>
                <Space h="lg" />
                <ParticipantList participants={participants} />
              </>
            ) : (
              <div>
                <Title order={1}>Quiz Time!</Title>
                <ProgressBar width={progressBarWidth} timeLeft={timer} />
                {isManualControl && (
                  <>
                    {currentCorrectAnswer ? (
                      <Button
                        onClick={() => {
                          socket.emit('nextQuestion', { quizSessionId: id });
                          setCurrentCorrectAnswer(null);
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
                <CurrentQuestion
                  currentQuestion={currentQuestion}
                  renderQuestionInput={renderQuestionInput}
                  answer={currentCorrectAnswer}
                />
              </div>
            )}
          </>
        ) : (
          <Leaderboard results={results} />
        )}
      </Container>
    </div>
  );
};

export default QuizHostSession;
