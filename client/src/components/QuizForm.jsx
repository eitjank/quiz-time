import React, { useState, useEffect } from 'react';
import QuestionForm from './QuestionForm';
import { QUIZZES_ENDPOINT } from '../api/endpoints';
import QuestionBankSelector from './QuestionBankSelector';
import {
  Container,
  TextInput,
  Button,
  Textarea,
  Group,
  Space,
} from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

function QuizForm({ initialQuiz, onSubmit }) {
  const [name, setName] = useState(initialQuiz ? initialQuiz.name : '');
  const [description, setDescription] = useState(
    initialQuiz ? initialQuiz.description : ''
  );
  const [questions, setQuestions] = useState(
    initialQuiz
      ? initialQuiz.questions
      : [
          {
            type: 'multipleChoice',
            question: '',
            options: [''],
            answer: [],
            timeLimit: 10,
          },
        ]
  );
  const [visibility, setVisibility] = useState(
    initialQuiz ? initialQuiz.visibility : 'public'
  );
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialQuiz) {
      setName(initialQuiz.name);
      setDescription(initialQuiz.description);
      setQuestions(initialQuiz.questions);
      setVisibility(initialQuiz.visibility);
    }
  }, [initialQuiz]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, description, visibility, questions });
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${QUIZZES_ENDPOINT}/${initialQuiz.id}/export`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'quiz.json');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    }
  };

  const addQuestionToQuizFromQuestionBank = (question) => {
    setQuestions((prevQuestions) => [...prevQuestions, question]);
    setShowQuestionBank(false);
  };

  return (
    <div>
      <Container size="xl">
        <h1>{initialQuiz ? 'Edit Quiz' : 'Create Quiz'}</h1>
        <Group justify="center">
          <Button variant="default" type="button" onClick={handleExport}>
            Export Quiz
          </Button>
        </Group>
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextInput
            component="select"
            label="Visibility"
            rightSection={<IconChevronDown size={14} stroke={1.5} />}
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </TextInput>
          <label>
            <h2>Questions:</h2>
            {questions.map((question, index) => (
              <div key={index}>
                <QuestionForm
                  key={index}
                  index={index}
                  questions={questions}
                  setQuestions={setQuestions}
                />
                <Space h="lg" />
              </div>
            ))}
            <Group justify="center">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setQuestions([
                    ...questions,
                    {
                      type: 'multipleChoice',
                      question: '',
                      options: [''],
                      answer: [],
                      timeLimit: 10,
                    },
                  ]);
                }}
              >
                Add Question
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setShowQuestionBank(true);
                }}
              >
                Add Question from Question Bank
              </Button>
            </Group>
            {showQuestionBank && (
              <QuestionBankSelector
                addQuestionToQuiz={addQuestionToQuizFromQuestionBank}
              />
            )}
          </label>
          <Space h="lg" />
          <Group justify="center">
            <Button type="submit">
              {initialQuiz ? 'Update Quiz' : 'Create Quiz'}
            </Button>
            <Button variant="default" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Group>
        </form>
      </Container>
    </div>
  );
}

export default QuizForm;
