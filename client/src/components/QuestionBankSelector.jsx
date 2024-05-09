import React, { useEffect, useState } from 'react';
import { QUESTIONS_ENDPOINT } from '../api/endpoints';
import { Button, Paper, Container, Autocomplete, Space } from '@mantine/core';
import TagSearch from './TagSearch/TagSearch';
import { toast } from 'react-toastify';

const QuestionBankSelector = ({ addQuestionToQuiz }) => {
  const [questionBank, setQuestionBank] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${QUESTIONS_ENDPOINT}`, { credentials: 'include' })
      .then((response) => {
        if (!response.ok) {
          toast.error(`Failed to fetch questions. ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        setQuestionBank(data);
        const uniqueTags = [...new Set(data.map((q) => q.tags).flat())];
        setTags(uniqueTags);
      })
      .catch((error) => console.error(error));
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const filteredQuestions = questionBank
    ? questionBank.filter(
        (question) =>
          selectedTags.every((tag) => question.tags.includes(tag)) &&
          question.question.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <>
      <TagSearch
        tags={tags}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />
      <Space h="sm" />
      <Autocomplete
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search questions..."
      />
      {questionBank.length > 0 &&
        filteredQuestions.map((question, index) => (
          <Paper shadow="md" key={index}>
            <Container size="md">
              <p>{question.question}</p>
              <Button onClick={() => addQuestionToQuiz(question)}>
                Add to Quiz
              </Button>
            </Container>
          </Paper>
        ))}
    </>
  );
};

export default QuestionBankSelector;
