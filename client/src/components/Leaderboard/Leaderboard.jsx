import React from 'react';
import './Leaderboard.css';
import {
  Paper,
  Space,
  Table,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';

function Leaderboard({ results, currentUserId }) {
  const { colorScheme } = useMantineColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#4a4a4a' : '#d9eaf7';
  return (
    <div>
      <Title order={2}>Results</Title>
      <Space h="sm" />
      <Paper shadow="md">
        <Table withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Text align="center">Rank</Text>
              </Table.Th>
              <Table.Th>
                <Text align="center">Participant</Text>
              </Table.Th>
              <Table.Th>
                <Text align="center">Score</Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {results
              .sort((a, b) => b.totalScore - a.totalScore)
              .map((participant, index) => (
                <Table.Tr
                  key={index}
                  style={{
                    backgroundColor:
                      currentUserId === participant.id ? backgroundColor : '',
                  }}
                >
                  <Table.Td data-testid="rank-cell">{index + 1}</Table.Td>
                  <Table.Td data-testid="participant-name">
                    {participant.name}
                  </Table.Td>
                  <Table.Td data-testid="score">
                    {participant.totalScore}
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </div>
  );
}

export default Leaderboard;
