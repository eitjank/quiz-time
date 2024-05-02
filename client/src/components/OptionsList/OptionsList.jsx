import React from 'react';
import { Stack, Text } from '@mantine/core';
import BorderedCard from '../BorderedCard/BorderedCard';

const OptionsList = ({ options }) => {
  return (
    <Stack gap="sm">
      {options.map((option, index) => (
        <BorderedCard key={index}>
          <Text>{option}</Text>
        </BorderedCard>
      ))}
    </Stack>
  );
};

export default OptionsList;
