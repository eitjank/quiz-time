import React, { useEffect, useState } from 'react';
import QuestionForm from '../components/QuestionForm';
import { Button, Container, Group, Loader } from '@mantine/core';
import { toast } from 'react-toastify';
import { QUESTIONS_ENDPOINT } from '../api/endpoints';
import { useNavigate, useParams } from 'react-router-dom';

const QuestionEdit = ({ isEditing }) => {
  const [questions, setQuestions] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing) {
      fetch(`${QUESTIONS_ENDPOINT}/${id}`, {
        credentials: 'include',
      })
        .then((response) => response.json())
        .then((data) => {
          setQuestions([data]);
        })
        .catch((error) => {
          console.error(error);
          toast.error(error.message);
        });
    } else {
      setQuestions([
        {
          type: 'multipleChoice',
          question: '',
          answer: [],
          options: [''],
          timeLimit: 10,
          folder: '/',
          tags: [],
        },
      ]);
    }
  }, [id, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${QUESTIONS_ENDPOINT}/${id}` : QUESTIONS_ENDPOINT;
    fetch(url, {
      method: method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questions[0]),
    })
      .then((response) => {
        if (!response.ok) {
          // save/update
          const update_save = isEditing ? 'update' : 'save';
          toast.error(
            `Failed to ${update_save} question. ${response.statusText}`
          );
          throw new Error(
            `Failed to ${update_save} question. ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((data) => {
        toast('Question saved successfully');
        navigate(-1);
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  const handleCancelEditingQuestion = () => {
    navigate(-1);
  };

  if (!questions.length) {
    return <Loader />;
  }

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <QuestionForm
          questions={questions}
          setQuestions={setQuestions}
          index={0}
          isQuestionBank={true}
        />
        <Group justify="center">
          <Button type="submit">Save</Button>
          <Button variant="default" onClick={handleCancelEditingQuestion}>
            Cancel
          </Button>
        </Group>
      </form>
    </Container>
  );
};

export default QuestionEdit;
