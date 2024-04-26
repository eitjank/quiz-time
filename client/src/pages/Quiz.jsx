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
import {
  Container,
  Radio,
  TextInput,
  Stack,
  Group,
  Button,
  Title,
  Space,
  Modal,
  Alert,
} from '@mantine/core';
import ParticipantList from '../components/ParticipantList';
import CurrentQuestion from '../components/CurrentQuestion';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import { toast } from 'react-toastify';

function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [timer, setTimer] = useState(null);
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [joined, setJoined] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, results, finished, participants, scoreByTime } =
    useQuizSession(id);
  const [progressBarWidth, setProgressBarWidth] = useState(100);
  const [name, setName] = useState('');
  const [nameModalOpened, nameModalHandlers] = useDisclosure(false);
  const [hostLeftModalOpened, hostLeftModalHandlers] = useDisclosure(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

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
      setAnswerSubmitted(false);

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

    socket.on('timeUpdate', (timeRemaining) => {
      setTimer(timeRemaining);
    });

    socket.on('joinedQuiz', (data) => {
      if (data.success) {
        setJoined(true);
      } else {
        setJoined(false);
        toast.error(data.message);
        navigate('/');
      }
    });

    socket.on('hostLeft', () => {
      hostLeftModalHandlers.open();
    });

    // socket.on('answerResult', (data) => {
    //   console.log(data);
    // });

    return () => {
      // Clean up the socket connection
      socket.off('joinedQuiz');
      socket.off('receiveQuestion');
      socket.off('timeUpdate');
      // socket.off('answerResult');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate, socket]);

  useEffect(() => {
    if (!socket || !name || !joined) return;
    console.log('Changing name');
    nameModalHandlers.open(); // Open the modal to change the name
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, name, socket, joined]);

  useEffect(() => {
    if (timer !== null && timer <= 0) {
      setShowAnswer(true);
      setIsCorrect(answer === currentQuestion.answer);
      if (!scoreByTime) {
        socket.emit('submitAnswer', { quizSessionId: id, answer });
      }
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
    nameModalHandlers.close();
  };

  const handleSubmitAnswer = (answer) => {
    if (!socket) return;
    socket.emit('submitAnswer', { quizSessionId: id, answer });
    setAnswerSubmitted(true);
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
                  disabled={showAnswer || (scoreByTime && answer !== '')}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    if (scoreByTime) {
                      handleSubmitAnswer(e.target.value);
                    }
                  }}
                />
              ))}
            </Stack>
          </Group>
        );
      case 'openEnded':
        return (
          <>
            <TextInput
              type="text"
              value={answer}
              disabled={showAnswer || (scoreByTime && answerSubmitted)}
              onChange={(e) => setAnswer(e.target.value)}
            />
            {scoreByTime && (
              <Button
                disabled={answer === '' || answerSubmitted}
                onClick={() => {
                  if (!answerSubmitted) {
                    handleSubmitAnswer(answer);
                  }
                }}
              >
                Submit
              </Button>
            )}
          </>
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
                  disabled={showAnswer || (scoreByTime && answer !== '')}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    if (scoreByTime) {
                      handleSubmitAnswer(e.target.value);
                    }
                  }}
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
        opened={nameModalOpened}
        close={nameModalHandlers.close}
        name={name}
        setName={setName}
        handleNameSubmit={handleNameSubmit}
        generateRandomName={generateRandomName}
      />
      <Modal
        opened={hostLeftModalOpened}
        onClose={() => {}}
        size="xs"
        withCloseButton={false}
        centered
      >
        <Alert color="red" title="Host has left">
          The host has left the quiz. The quiz has ended.
        </Alert>
        <Space h="md" />
        <Group justify="center">
          <Button variant="outline" onClick={() => navigate('/')}>
            Return to main page
          </Button>
        </Group>
      </Modal>
      <Title order={1}>Quiz Time!</Title>
      <Space h="sm" />
      {!finished ? (
        <>
          {!currentQuestion.question ? (
            <>
              <Title order={2}>Participants:</Title>
              <Space h="lg" />
              <Container size="lg">
                <ParticipantList participants={participants} />
              </Container>
            </>
          ) : (
            <>
              {currentQuestion.question && (
                <ProgressBar width={progressBarWidth} timeLeft={timer} />
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
