import React from 'react';
import './Leaderboard.css';
import { Paper, Space, Table, Text, Title } from '@mantine/core';

function Leaderboard({ results }) {
  return (
    <div>
      <Title order={2}>Results</Title>
      <Space h="sm" />
      <Paper shadow="md">
        <Table withTableBorder withColumnBorders striped>
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
                <Table.Tr key={index}>
                  <Table.Td data-testid="rank-cell">{index + 1}</Table.Td>
                  <Table.Td data-testid="participant-name">
                    {participant.name}
                  </Table.Td>
                  <Table.Td data-testid="score">{participant.totalScore}</Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </div>
  );
}

export default Leaderboard;
