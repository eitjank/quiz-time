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
import NameModal from '../components/NameModal/NameModal';
import {
  Container,
  TextInput,
  Group,
  Button,
  Title,
  Space,
  Modal,
  Alert,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import ParticipantList from '../components/ParticipantList/ParticipantList';
import CurrentQuestion from '../components/CurrentQuestion';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import { toast } from 'react-toastify';

function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [timer, setTimer] = useState(null);
  const [answer, setAnswer] = useState([]);
  const [currentCorrectAnswer, setCurrentCorrectAnswer] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [joined, setJoined] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, results, finished, participants } = useQuizSession(id);
  const [progressBarWidth, setProgressBarWidth] = useState(100);
  const [name, setName] = useState('');
  const [nameModalOpened, nameModalHandlers] = useDisclosure(false);
  const [hostLeftModalOpened, hostLeftModalHandlers] = useDisclosure(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [currentQuestionScore, setCurrentQuestionScore] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const { colorScheme } = useMantineColorScheme();
  const color = colorScheme === 'dark' ? 'blue' : '#5474B4';

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
      setAnswer([]);
      setCurrentCorrectAnswer(null);
      setIsCorrect(null);
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

    socket.on('correctAnswer', ({ correctAnswer }) => {
      setCurrentCorrectAnswer(correctAnswer);
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

    socket.on('answerResult', (data) => {
      setCurrentQuestionScore(data.score);
      setTotalScore(data.totalScore);
      setIsCorrect(data.score === 0 ? false : true);
      if (data.score === 0) {
        const audio = new Audio('/sounds/incorrect.mp3');
        audio.play();
        toast.error('Your answer is incorrect.', {
          position: 'bottom-center',
          pauseOnHover: false,
          autoClose: 2500,
        });
      } else {
        const audio = new Audio('/sounds/correct.mp3');
        audio.play();
        toast.success('Your answer is correct!', {
          position: 'bottom-center',
          pauseOnHover: false,
          autoClose: 2500,
        });
      }
    });

    return () => {
      // Clean up the socket connection
      socket.off('joinedQuiz');
      socket.off('receiveQuestion');
      socket.off('timeUpdate');
      socket.off('correctAnswer');
      socket.off('answerResult');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate, socket]);

  useEffect(() => {
    if (!socket || !name || !joined) return;
    nameModalHandlers.open(); // Open the modal to change the name
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, name, socket, joined]);

  useEffect(() => {
    if (timer !== null && timer <= 0) {
      if (!answerSubmitted) {
        socket.emit('submitAnswer', { quizSessionId: id, answer });
        setAnswerSubmitted(true);
      }
    } else {
      setIsCorrect(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const generateRandomName = () => {
    let name = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      style: 'capital',
      separator: ' ',
    });
    if (name.length > 25) {
      name = name.substring(0, 25);
    }
    return name;
  };

  const handleNameSubmit = (event) => {
    event.preventDefault();
    // Don't submit if the name is empty
    if (name.trim() === '') {
      return;
    }
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
          <>
            <Group justify="center">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  id={`option-${index}`}
                  name="quizOption"
                  variant={answer.includes(option) ? 'outline' : 'default'}
                  color={color}
                  size="lg"
                  disabled={currentCorrectAnswer || answerSubmitted}
                  onClick={() => {
                    if (answer.includes(option)) {
                      setAnswer((prevAnswer) =>
                        prevAnswer.filter((ans) => ans !== option)
                      );
                    } else {
                      setAnswer((prevAnswer) => [...prevAnswer, option]);
                    }
                  }}
                  style={{
                    width: '100%',
                  }}
                >
                  {option}
                </Button>
              ))}
            </Group>
            <Space h="md" />
            <Button
              disabled={
                currentCorrectAnswer || answer.length === 0 || answerSubmitted
              }
              onClick={() => {
                if (!answerSubmitted) {
                  handleSubmitAnswer(answer);
                }
              }}
            >
              Submit
            </Button>
            <Space h="sm" />
          </>
        );
      case 'openEnded':
        return (
          <>
            <TextInput
              type="text"
              value={answer[0]}
              disabled={currentCorrectAnswer || answerSubmitted}
              onChange={(e) => setAnswer([e.target.value])}
            />
            <Space h="sm" />
            <Button
              disabled={answer[0] === '' || answerSubmitted}
              onClick={() => {
                if (!answerSubmitted) {
                  handleSubmitAnswer(answer);
                }
              }}
            >
              Submit
            </Button>
            <Space h="sm" />
          </>
        );
      case 'trueFalse':
        return (
          <>
            <Group justify="center">
              {['True', 'False'].map((option, index) => (
                <Button
                  key={index}
                  id={`trueFalse-${index}`}
                  name="trueFalseOption"
                  variant={answer[0] === option ? 'outline' : 'default'}
                  color={color}
                  size="lg"
                  disabled={currentCorrectAnswer || answerSubmitted}
                  onClick={() => setAnswer([option])}
                  style={{
                    width: '100%',
                  }}
                >
                  {option}
                </Button>
              ))}
            </Group>
            <Space h="md" />
            <Button
              disabled={answer[0] === '' || answerSubmitted}
              onClick={() => {
                if (!answerSubmitted) {
                  handleSubmitAnswer(answer);
                }
              }}
            >
              Submit
            </Button>
          </>
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
      <Container size="lg">
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
                <ParticipantList
                  participants={participants}
                  currentUserId={socket ? socket.id : null}
                />
              </>
            ) : (
              <>
                {currentQuestion.question && (
                  <ProgressBar width={progressBarWidth} timeLeft={timer} />
                )}
                <CurrentQuestion
                  currentQuestion={currentQuestion}
                  renderQuestionInput={renderQuestionInput}
                  answer={currentCorrectAnswer}
                />
                {isCorrect !== null &&
                  (isCorrect ? (
                    <>
                      <Text>Your answer is correct!</Text>
                      {currentQuestionScore && (
                        <Text>You got: {currentQuestionScore} points</Text>
                      )}
                      {totalScore && (
                        <Text>Your total score: {totalScore}</Text>
                      )}
                    </>
                  ) : (
                    <Text>Your answer is incorrect.</Text>
                  ))}
              </>
            )}
          </>
        ) : (
          <Leaderboard
            results={results}
            currentUserId={socket ? socket.id : null}
          />
        )}
      </Container>
    </>
  );
}

export default Quiz;
