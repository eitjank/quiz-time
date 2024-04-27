import React, { useEffect, useState } from 'react';
import { QUESTIONS_ENDPOINT } from '../api/endpoints';
import { Button, Paper, Container } from '@mantine/core';
import TagSearch from './TagSearch';
import { toast } from 'react-toastify';

const QuestionBankSelector = ({ addQuestionToQuiz }) => {
  const [questionBank, setQuestionBank] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

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

  return (
    <>
      <TagSearch
        tags={tags}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />
      {questionBank.length > 0 &&
        questionBank
          .filter((question) =>
            selectedTags.every((tag) => question.tags.includes(tag))
          )
          .map((question, index) => (
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
