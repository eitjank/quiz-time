import React from 'react';
import { Paper, Stack, Text } from '@mantine/core';
import './OptionsList.css';

const OptionsList = ({ options }) => {
  return (
    <Stack gap="sm">
      {options.map((option, index) => (
        <Paper
          key={index}
          className='options-list-paper'
          shadow="lg"
        >
          <Text>{option}</Text>
        </Paper>
      ))}
    </Stack>
  );
};

export default OptionsList;
