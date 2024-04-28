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
  Group,
  Space,
  FileButton,
  Pagination,
  Autocomplete,
  Text,
  Title,
  AppShell,
  Stack,
  Burger,
} from '@mantine/core';
import TagSearch from '../components/TagSearch';
import { readFile } from '../utils/readFile';
import BorderedCard from '../components/BorderedCard';

function QuestionBank() {
  const [questions, setQuestions] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [index, setIndex] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const [selectedFolder, setSelectedFolder] = useState('/');
  const [folders, setFolders] = useState([]);
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

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
      })
      .catch((error) => console.error(error));
  }, []);

  // update tags when questions change
  useEffect(() => {
    if (questions) {
      const uniqueTags = [...new Set(questions.map((q) => q.tags).flat())];
      setTags(uniqueTags);
      const uniqueFolders = [...new Set(questions.map((q) => q.folder))];
      setFolders(uniqueFolders);
    }
  }, [questions]);

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setIndex(questions.findIndex((q) => q._id === question._id));
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
        setIndex(null);
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

  const handleFolderChange = (folder) => {
    setSelectedFolder(folder);
  };
  
  const toggleNavbar = () => {
    setIsNavbarOpen((prevIsNavbarOpen) => !prevIsNavbarOpen);
  };

  const filteredQuestions = questions
    ? questions.filter(
        (question) =>
          selectedTags.every((tag) => question.tags.includes(tag)) &&
          question.folder === selectedFolder &&
          question.question.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <Container>
      {isNavbarOpen && (
        <AppShell.Navbar p="md">
          <Group justify="center">
            <Burger opened={true} onClick={toggleNavbar} />
          </Group>
          <Title order={4}>Folders</Title>
          <Space h="sm" />
          <Stack>
            <Button
              variant="default"
              onClick={() => {
                const newFolder = prompt('Enter folder name');
                if (newFolder) {
                  // also check if folder already exists if so, don't add
                  if (folders.includes(newFolder)) {
                    alert('Folder already exists');
                  } else {
                    setFolders([...folders, newFolder]);
                  }
                }
              }}
            >
              Add Folder
            </Button>
            {folders.map((folder) => (
              <Button
                variant="subtle"
                key={folder}
                color={folder === selectedFolder ? 'blue' : 'gray'}
                onClick={() => handleFolderChange(folder)}
              >
                {folder}
              </Button>
            ))}
          </Stack>
        </AppShell.Navbar>
      )}
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
            <Button variant="default" onClick={handleCancelEditingQuestion}>
              Cancel
            </Button>
          </Group>
        </form>
      ) : (
        <>
          <Title order={1}>My Question Bank</Title>
          <Space h="md" />
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
          <Space h="xs" />
          <TagSearch
            tags={tags}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
          <Space h="xs" />
          <Button variant="default" onClick={toggleNavbar}>
            Folders
          </Button>
          <Space h="lg" />
          <Autocomplete
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search questions..."
          />
          <Space h="lg" />
          <Button onClick={() => handleCreateQuestion()}>Add Question</Button>
          <Space h="lg" />
          {filteredQuestions &&
            filteredQuestions.slice(startIndex, endIndex).map((question) => (
              <BorderedCard key={question._id}>
                <Group>
                  <Text
                    style={{
                      flex: '1',
                      marginRight: '1em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {question.question}
                  </Text>
                  <Button onClick={() => handleEdit(question)}>Edit</Button>
                  <Button
                    variant="outline"
                    color="red"
                    onClick={() => handleDelete(question)}
                  >
                    Delete
                  </Button>
                </Group>
              </BorderedCard>
            ))}
          <Group justify="center">
            {filteredQuestions && (
              <Pagination
                total={Math.ceil(filteredQuestions.length / itemsPerPage)}
                value={currentPage}
                onChange={setCurrentPage}
              />
            )}
          </Group>
          <Space h="sm" />
        </>
      )}
    </Container>
  );
}

export default QuestionBank;
