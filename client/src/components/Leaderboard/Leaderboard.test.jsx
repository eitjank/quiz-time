import { render, screen } from '../../test-utils';
import Leaderboard from './Leaderboard';

const mockResults = [
  { name: 'John Doe', score: 100 },
  { name: 'Jane Doe', score: 90 },
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
        participant.score.toString()
      );
    });
  });

  it('sorts the participants in descending order based on their scores', () => {
    render(<Leaderboard results={mockResults} />);

    const participantNames = screen.getAllByTestId('participant-name');
    const participantScores = screen.getAllByTestId('score');

    const sortedResults = [...mockResults].sort((a, b) => b.score - a.score);

    sortedResults.forEach((participant, index) => {
      expect(participantNames[index]).toHaveTextContent(participant.name);
      expect(participantScores[index]).toHaveTextContent(
        participant.score.toString()
      );
    });
  });
});
