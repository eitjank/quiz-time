import { render, screen } from '../../test-utils';
import Leaderboard from './Leaderboard';

const mockResults = [
  { name: 'John Doe', totalScore: 100 },
  { name: 'Jane Doe', totalScore: 90 },
];

describe('Leaderboard', () => {
  it('renders the leaderboard table with correct participant names and scores', () => {
    render(<Leaderboard results={mockResults} />);

    const participantNames = screen.getAllByTestId('participant-name');
    const participantScores = screen.getAllByTestId('score');

    expect(participantNames).toHaveLength(mockResults.length);
    expect(participantScores).toHaveLength(mockResults.length);

    mockResults.forEach((participant, index) => {
      expect(participantNames[index]).toHaveTextContent(participant.name);
      expect(participantScores[index]).toHaveTextContent(
        participant.totalScore.toString()
      );
    });
  });

  it('sorts the participants in descending order based on their scores', () => {
    render(<Leaderboard results={mockResults} />);

    const participantNames = screen.getAllByTestId('participant-name');
    const participantScores = screen.getAllByTestId('score');

    const sortedResults = [...mockResults].sort((a, b) => b.totalScore - a.totalScore);

    sortedResults.forEach((participant, index) => {
      expect(participantNames[index]).toHaveTextContent(participant.name);
      expect(participantScores[index]).toHaveTextContent(
        participant.totalScore.toString()
      );
    });
  });
});
