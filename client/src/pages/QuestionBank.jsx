import React, { useEffect, useState } from 'react';
import {
  QUESTIONS_ENDPOINT,
  QUESTIONS_IMPORT_EXPORT_ENDPOINT,
} from '../api/endpoints';
import QuestionForm from '../components/QuestionForm';
import { toast } from 'react-toastify';
import {
  Button,
  Container,
  Grid,
  Paper,
  Group,
  Space,
  FileButton,
  Pagination,
  Autocomplete,
} from '@mantine/core';
import TagSearch from '../components/TagSearch';
import { readFile } from '../utils/readFile';

function QuestionBank() {
  const [questions, setQuestions] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [index, setIndex] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  useEffect(() => {
    fetch(`${QUESTIONS_ENDPOINT}`, {
      credentials: 'include',
    })
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
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          toast.error(`Failed to delete question. ${response.statusText}`);
          throw new Error(`Failed to delete question. ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        toast('Question deleted successfully');
        setQuestions(questions.filter((q) => q._id !== question._id));
      })
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
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editingQuestion),
    })
      .then((response) => {
        if (!response.ok) {
          // save/update
          const update_save = editingQuestion._id ? 'update' : 'save';
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
        const newQuestions = [...questions];
        newQuestions[index] = data;
        setQuestions(newQuestions);
        setEditingQuestion(null);
        toast('Question saved successfully');
      })
      .catch((error) => console.error(error));
  };

  const exportQuestions = () => {
    fetch(`${QUESTIONS_IMPORT_EXPORT_ENDPOINT}`, {
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          toast.error(`Failed to export questions. ${response.statusText}`);
          throw new Error(`Failed to export questions. ${response.statusText}`);
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'questions.json';
        a.click();
      })
      .catch((error) => console.error(error));
  };

  const handleImport = async (file) => {
    try {
      const content = await readFile(file);
      const json = JSON.parse(content);
      const response = await fetch(`${QUESTIONS_IMPORT_EXPORT_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(json),
      });

      if (!response.ok) {
        toast.error(`Failed to import questions. ${response.statusText}`);
        throw new Error(`Failed to import questions. ${response.statusText}`);
      }

      toast('Questions imported successfully');

      fetch(`${QUESTIONS_ENDPOINT}`, {
        credentials: 'include',
      })
        .then((response) => response.json())
        .then((data) => {
          setQuestions(data);
          const uniqueTags = [...new Set(data.map((q) => q.tags).flat())];
          setTags(uniqueTags);
        })
        .catch((error) => console.error(error));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQuestions = questions
    ? questions.filter(
        (question) =>
          selectedTags.every((tag) => question.tags.includes(tag)) &&
          question.question.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <Container>
      {editingQuestion ? (
        <form onSubmit={handleSubmit}>
          <QuestionForm
            questions={questions}
            setQuestions={setQuestions}
            index={index}
            isQuestionBank={true}
          />
          <br />
          <Group justify="center">
            <Button type="submit">Save</Button>
            <Button variant="default" onClick={handleCancelEditingQuestion}>Cancel</Button>
          </Group>
        </form>
      ) : (
        <>
          <h1>My Question Bank</h1>
          <Group justify="center">
            <Button variant="default" onClick={exportQuestions}>
              Export Questions
            </Button>
            <FileButton
              variant="default"
              onChange={handleImport}
              accept="application/json"
            >
              {(props) => <Button {...props}>Import Questions</Button>}
            </FileButton>
          </Group>
          <TagSearch
            tags={tags}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
          <Space h="lg" />
          <Autocomplete
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search questions..."
          />
          <Space h="lg" />
          <Button onClick={() => handleCreateQuestion()}>Add Question</Button>
          <Grid gutter="md">
            {filteredQuestions &&
              filteredQuestions
                .slice(startIndex, endIndex)
                .map((question, index) => (
                  <Grid.Col key={question._id}>
                    <Paper shadow="md">
                      <p>{question.question}</p>
                      <Group justify="center">
                        <Button onClick={() => handleEdit(question, index)}>
                          Edit
                        </Button>
                        <Button variant="outline" color='red' onClick={() => handleDelete(question)}>
                          Delete
                        </Button>
                      </Group>
                      <Space h="lg" />
                    </Paper>
                  </Grid.Col>
                ))}
            <Container>
              {filteredQuestions && (
                <Pagination
                  total={Math.ceil(filteredQuestions.length / itemsPerPage)}
                  value={currentPage}
                  onChange={setCurrentPage}
                />
              )}
            </Container>
          </Grid>
        </>
      )}
    </Container>
  );
}

export default QuestionBank;
