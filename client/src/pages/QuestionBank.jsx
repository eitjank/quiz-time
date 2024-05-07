import React, { useEffect, useState } from 'react';
import {
  MOVE_QUESTION_ENDPOINT,
  QUESTIONS_ENDPOINT,
  QUESTIONS_IMPORT_EXPORT_ENDPOINT,
} from '../api/endpoints';
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
  Select,
  Divider,
} from '@mantine/core';
import TagSearch from '../components/TagSearch/TagSearch';
import { readFile } from '../utils/readFile';
import BorderedCard from '../components/BorderedCard/BorderedCard';
import { IconFolder } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

function QuestionBank() {
  const [questions, setQuestions] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const navigate = useNavigate();

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
    navigate(`/question/${question._id}/edit`);
  };

  const handleCreateQuestion = () => {
    navigate('/question/create');
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
      toast.error(err.message);
    }
  };

  function moveQuestion(questionId, newFolder) {
    fetch(`${MOVE_QUESTION_ENDPOINT}/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ newFolder }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          toast(data.message);
          // change folder in state
          const newQuestions = questions.map((question) => {
            if (question._id === questionId) {
              question.folder = newFolder;
            }
            return question;
          });
          setQuestions(newQuestions);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  }

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
          (!selectedFolder || question.folder === selectedFolder) &&
          question.question.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <Container>
      {isNavbarOpen && (
        <AppShell.Navbar
          p="md"
          style={{
            width: '200px',
          }}
        >
          <Group justify="center">
            <Burger size="sm" opened={true} onClick={toggleNavbar} />
          </Group>
          <Title order={4}>Folders</Title>
          <Space h="sm" />
          <Stack>
            <Button
              variant="default"
              onClick={() => {
                const newFolder = prompt('Enter folder name');
                if (newFolder) {
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
            <Divider />
            <Button
              variant="subtle"
              color={selectedFolder === null ? 'blue' : 'gray'}
              onClick={() => handleFolderChange(null)}
            >
              View All Questions
            </Button>
            {folders.map((folder) => (
              <Button
                variant="subtle"
                key={folder}
                color={folder === selectedFolder ? 'blue' : 'gray'}
                onClick={() => handleFolderChange(folder)}
              >
                <IconFolder
                  size={18}
                  style={{
                    marginRight: '6px',
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {folder}
                </div>
              </Button>
            ))}
          </Stack>
        </AppShell.Navbar>
      )}
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
      <Button
        variant="outline"
        color={isNavbarOpen === true ? 'blue' : 'gray'}
        onClick={toggleNavbar}
      >
        <IconFolder size={18} />
        Folders
      </Button>
      <Space h="xs" />
      <TagSearch
        tags={tags}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />
      <Space h="xs" />
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
              <Select
                data={folders.map((folder) => ({
                  value: folder,
                  label: folder,
                }))}
                placeholder="Move to..."
                style={{ width: 128 }}
                onChange={(folder) => {
                  moveQuestion(question._id, folder);
                }}
              />
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
    </Container>
  );
}

export default QuestionBank;
