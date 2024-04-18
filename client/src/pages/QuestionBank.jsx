import React, { useEffect, useState } from 'react';
import { QUESTIONS_ENDPOINT } from '../api/endpoints';
import QuestionForm from '../components/QuestionForm';
import { toast } from 'react-toastify';
import { Button, Container, Grid, Paper, Group, Space } from '@mantine/core';
import TagSearch from '../components/TagSearch';

function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [index, setIndex] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    fetch(`${QUESTIONS_ENDPOINT}`)
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data);
        const uniqueTags = [...new Set(data.map((q) => q.tags).flat())];
        setTags(uniqueTags);
      })
      .catch((error) => console.error(error));
  }, []);

  const handleEdit = (question, index) => {
    setEditingQuestion(question);
    setIndex(index);
  };

  const handleCreateQuestion = () => {
    const newQuestion = {
      type: 'multipleChoice',
      question: '',
      answer: '',
      options: [''],
      timeLimit: 10,
    };
    setEditingQuestion(newQuestion);
    setQuestions([...questions, newQuestion]);
    setIndex(questions.length);
  };

  const handleCancelEditingQuestion = () => {
    setEditingQuestion(null);
    setQuestions(questions.filter((q) => q._id));
    setIndex(null);
  };

  const handleDelete = (question) => {
    fetch(`${QUESTIONS_ENDPOINT}/${question._id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          toast.error('Failed to delete question');
          throw new Error('Failed to delete question');
        }
        return response.json();
      })
      .then((data) =>
        setQuestions(questions.filter((q) => q._id !== question._id))
      )
      .catch((error) => console.error(error));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editingQuestion._id ? 'PUT' : 'POST';
    const url = editingQuestion._id
      ? `${QUESTIONS_ENDPOINT}/${editingQuestion._id}`
      : QUESTIONS_ENDPOINT;
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editingQuestion),
    })
      .then((response) => {
        if (!response.ok) {
          // save/update
          const update_save = editingQuestion._id ? 'update' : 'save';
          toast.error(`Failed to ${update_save} question`);
          throw new Error(`Failed to ${update_save} question`);
        }
        return response.json();
      })
      .then((data) => {
        const newQuestions = [...questions];
        newQuestions[index] = data;
        setQuestions(newQuestions);
        setEditingQuestion(null);
      })
      .catch((error) => console.error(error));
  };

  return (
    <Container>
      {editingQuestion ? (
        <form onSubmit={handleSubmit}>
          <QuestionForm
            questions={questions}
            setQuestions={setQuestions}
            index={index}
          />
          <br />
          <Group justify="center">
            <Button onClick={handleCancelEditingQuestion}>Cancel</Button>
            <Button type="submit">Save</Button>
          </Group>
        </form>
      ) : (
        <>
          <TagSearch
            tags={tags}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
          <Grid gutter="md">
            {questions
              .filter((question) =>
                selectedTags.every((tag) => question.tags.includes(tag))
              )
              .map((question, index) => (
                <Grid.Col key={question._id}>
                  <Paper shadow="md">
                    <p>{question.question}</p>
                    <Group justify="center">
                      <Button onClick={() => handleEdit(question, index)}>
                        Edit
                      </Button>
                      <Button onClick={() => handleDelete(question)}>
                        Delete
                      </Button>
                    </Group>
                    <Space h="lg" />
                  </Paper>
                </Grid.Col>
              ))}
          </Grid>
          <br />
          <Button onClick={() => handleCreateQuestion()}>Add Question</Button>
        </>
      )}
    </Container>
  );
}

export default QuestionBank;
