import { render, screen } from '../../test-utils';
import ParticipantList from './ParticipantList';

it('renders ParticipantList and checks participant name', () => {
  const participants = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Doe' },
  ];

  render(<ParticipantList participants={participants} />);

  participants.forEach((participant) => {
    const participantElement = screen.getByText(participant.name);
    expect(participantElement).toBeInTheDocument();
  });
});
