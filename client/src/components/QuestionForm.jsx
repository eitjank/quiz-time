import React from 'react';
import { BASE_URL, FILE_UPLOAD_ENDPOINT } from '../api/endpoints';
import {
  Container,
  TextInput,
  Button,
  FileButton,
  Group,
  TagsInput,
  Stack,
  Space,
  Checkbox,
  Text,
} from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import BorderedCard from './BorderedCard/BorderedCard';

function QuestionForm({ index, questions, setQuestions, isQuestionBank }) {
  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    // If there's an old image, delete it
    if (questions[index].image) {
      await fetch(`${BASE_URL}/uploads/${questions[index].image}`, {
        method: 'DELETE',
      });
    }

    // Upload the new image
    try {
      const response = await fetch(FILE_UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      const newQuestions = [...questions];
      newQuestions[index].image = data.filePath;
      setQuestions(newQuestions);
    } catch (error) {
      console.error(error);
    }
  };

  const clearFile = () => {
    fetch(`${BASE_URL}/uploads/${questions[index].image}`, {
      method: 'DELETE',
    });
    const newQuestions = [...questions];
    newQuestions[index].image = '';
    setQuestions(newQuestions);
  };

  return (
    <div key={index}>
      <BorderedCard>
        <Container size="md">
          <TextInput
            component="select"
            label="Type"
            rightSection={<IconChevronDown size={14} stroke={1.5} />}
            data-testid="question-type-select"
            value={questions[index].type}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[index].type = e.target.value;
              setQuestions(newQuestions);
            }}
          >
            <option value="multipleChoice">Multiple Choice</option>
            <option value="openEnded">Open Ended</option>
            <option value="trueFalse">True False</option>
          </TextInput>
          <TextInput
            label="Question"
            data-testid="question-input"
            type="text"
            value={questions[index].question}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[index].question = e.target.value;
              setQuestions(newQuestions);
            }}
          />
          <br />
          <Group justify="center">
            <FileButton
              onChange={handleImageUpload}
              accept="image/png,image/jpeg"
            >
              {(props) => <Button {...props}>Upload image</Button>}
            </FileButton>
            <Button
              disabled={!questions[index].image}
              variant="outline"
              color="red"
              onClick={clearFile}
            >
              Remove Image
            </Button>
          </Group>
          <Space h="xs" />
          {questions[index].image && (
            <img
              src={`${BASE_URL}/${questions[index].image}`}
              alt="Question"
              style={{ maxWidth: '50%', height: 'auto' }}
            />
          )}
          {questions[index].type === 'multipleChoice' && (
            <>
              <Text>Options:</Text>
              <Text>Select the correct answers</Text>
              <Space h="xs" />
              <Stack gap="xs">
                {questions[index].options.map((option, optionIndex) => (
                  <div key={optionIndex}>
                    <Group justify="center">
                      <Checkbox
                        checked={questions[index].answer.includes(option)}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          if (!Array.isArray(newQuestions[index].answer)) {
                            newQuestions[index].answer = [];
                          }
                          if (e.target.checked) {
                            newQuestions[index].answer.push(option);
                          } else {
                            newQuestions[index].answer = newQuestions[
                              index
                            ].answer.filter((answer) => answer !== option);
                          }
                          setQuestions(newQuestions);
                        }}
                      />
                      <TextInput
                        data-testid="option-multiple-choice-input"
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[index].options[optionIndex] =
                            e.target.value;
                          setQuestions(newQuestions);
                        }}
                      />
                      <Button
                        variant="outline"
                        color="red"
                        onClick={(e) => {
                          e.preventDefault();
                          const newQuestions = [...questions];
                          newQuestions[index].options.splice(optionIndex, 1);
                          setQuestions(newQuestions);
                        }}
                      >
                        Remove Option
                      </Button>
                    </Group>
                  </div>
                ))}
              </Stack>
              <Space h="xs" />
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  const newQuestions = [...questions];
                  newQuestions[index].options.push('');
                  setQuestions(newQuestions);
                }}
              >
                Add Option
              </Button>
              <Space h="xs" />
            </>
          )}
          {questions[index].type === 'trueFalse' && (
            <>
              <Text>Select the correct answer</Text>
              <Space h="xs" />
              <Group justify="center">
                <Stack>
                  <Checkbox
                    label="True"
                    checked={questions[index].answer.includes('True')}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      if (e.target.checked) {
                        newQuestions[index].answer = ['True'];
                      } else {
                        newQuestions[index].answer = ['False'];
                      }
                      setQuestions(newQuestions);
                    }}
                  />
                  <Checkbox
                    label="False"
                    checked={questions[index].answer.includes('False')}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      if (e.target.checked) {
                        newQuestions[index].answer = ['False'];
                      } else {
                        newQuestions[index].answer = ['True'];
                      }
                      setQuestions(newQuestions);
                    }}
                  />
                </Stack>
              </Group>
              <Space h="xs" />
            </>
          )}

          {questions[index].type === 'openEnded' && (
            <TextInput
              label="Answer"
              data-testid="answer-input"
              type="text"
              value={questions[index].answer}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[index].answer = e.target.value;
                setQuestions(newQuestions);
              }}
            />
          )}
          <TextInput
            label="Time Limit (seconds)"
            type="number"
            value={questions[index].timeLimit}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[index].timeLimit = e.target.value;
              setQuestions(newQuestions);
            }}
            min={1}
            max={600}
          />
          {isQuestionBank && (
            <TagsInput
              label="Question Tags"
              placeholder="Press Enter to submit a tag"
              value={questions[index].tags}
              onChange={(tags) => {
                const newQuestions = [...questions];
                newQuestions[index].tags = tags;
                setQuestions(newQuestions);
              }}
            />
          )}
          {!isQuestionBank && (
            <>
              <br />
              <Button
                variant="outline"
                color="red"
                onClick={(e) => {
                  e.preventDefault();
                  const newQuestions = [...questions];
                  newQuestions.splice(index, 1);
                  setQuestions(newQuestions);
                  toast('Question removed', { autoClose: 2000 });
                }}
              >
                Remove Question
              </Button>
            </>
          )}
        </Container>
      </BorderedCard>
    </div>
  );
}

export default QuestionForm;
