import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Leaderboard from './Leaderboard';

describe('Leaderboard', () => {
  const results = [
    { name: 'participant1', score: 10 },
    { name: 'participant2', score: 15 },
    { name: 'participant3', score: 5 },
  ];

  it('renders leaderboard correctly', () => {
    render(<Leaderboard results={results} />);

    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(screen.getByText('Participant ID')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('participant2')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('participant1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('participant3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('sorts results in descending order', () => {
    render(<Leaderboard results={results} />);

    const rankCells = screen.getAllByTestId('rank-cell');
    const participantNames = screen.getAllByTestId('participant-name');
    const scores = screen.getAllByTestId('score');

    expect(rankCells[0]).toHaveTextContent('1');
    expect(participantNames[0]).toHaveTextContent('participant2');
    expect(scores[0]).toHaveTextContent('15');

    expect(rankCells[1]).toHaveTextContent('2');
    expect(participantNames[1]).toHaveTextContent('participant1');
    expect(scores[1]).toHaveTextContent('10');

    expect(rankCells[2]).toHaveTextContent('3');
    expect(participantNames[2]).toHaveTextContent('participant3');
    expect(scores[2]).toHaveTextContent('5');
  });
});