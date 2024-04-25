import React from 'react';
import { Paper, Stack, Text } from '@mantine/core';

const OptionsList = ({ options }) => {
  return (
    <Stack gap="sm">
      {options.map((option, index) => (
        <Paper
          key={index}
          style={{ backgroundColor: '#dcdcdc', padding: '20px' }}
          shadow="md"
        >
          <Text>{option}</Text>
        </Paper>
      ))}
    </Stack>
  );
};

export default OptionsList;
