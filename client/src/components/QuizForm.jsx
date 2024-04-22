import React, { useState, useEffect } from 'react';
import QuestionForm from './QuestionForm';
import { QUIZZES_ENDPOINT } from '../api/endpoints';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import QuestionBankSelector from './QuestionBankSelector';
import {
  Container,
  TextInput,
  Button,
  FileButton,
  Textarea,
  Group,
  Space,
} from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

function QuizForm({ initialQuiz, onSubmit }) {
  const [name, setName] = useState(initialQuiz ? initialQuiz.name : '');
  const [description, setDescription] = useState(
    initialQuiz ? initialQuiz.description : ''
  );
  const [questions, setQuestions] = useState(
    initialQuiz
      ? initialQuiz.questions
      : [{ type: 'multipleChoice', question: '', options: [''] }]
  );
  const [visibility, setVisibility] = useState(
    initialQuiz ? initialQuiz.visibility : 'public'
  );
  const navigate = useNavigate();
  const [showQuestionBank, setShowQuestionBank] = useState(false);

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
      console.log(res);
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

  const readFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e.target.error);
      reader.readAsText(file);
    });

  const handleImport = async (file) => {
    try {
      const content = await readFile(file);
      const json = JSON.parse(content);
      const response = await fetch(`${QUIZZES_ENDPOINT}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(json),
      });
      // navigate to the imported quiz
      const data = await response.json();
      navigate(`/quizzes/${data.quizId}/edit`);

      toast.success('Quiz imported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to import quiz');
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
          <Button type="button" onClick={handleExport}>
            Export Quiz
          </Button>
          <FileButton onChange={handleImport} accept="application/json">
            {(props) => <Button {...props}>Import Quiz</Button>}
          </FileButton>
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
                      answer: '',
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
          <br />
          <Button type="submit">
            {initialQuiz ? 'Update Quiz' : 'Create Quiz'}
          </Button>
        </form>
      </Container>
    </div>
  );
}

export default QuizForm;
