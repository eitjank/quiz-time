import { render, screen, fireEvent } from '../../test-utils';
import { useNavigate } from 'react-router-dom';
import JoinQuizForm from './JoinQuizForm';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('JoinQuizForm', () => {
  beforeEach(() => {
    useNavigate.mockClear();
  });

  it('renders the form correctly', () => {
    render(<JoinQuizForm />);
    const quizIdInput = screen.getByPlaceholderText('Enter Quiz ID');
    const joinButton = screen.getByText('Join Quiz');

    expect(quizIdInput).toBeInTheDocument();
    expect(joinButton).toBeInTheDocument();
  });

  it('updates the quizSessionId state when the input value changes', () => {
    render(<JoinQuizForm />);
    const quizIdInput = screen.getByPlaceholderText('Enter Quiz ID');

    fireEvent.change(quizIdInput, { target: { value: '12345' } });

    expect(quizIdInput.value).toBe('12345');
  });

  it('navigates to the correct quiz session when the form is submitted', () => {
    const navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);

    render(<JoinQuizForm />);
    const quizIdInput = screen.getByPlaceholderText('Enter Quiz ID');
    const joinButton = screen.getByText('Join Quiz');

    fireEvent.change(quizIdInput, { target: { value: '12345' } });
    fireEvent.click(joinButton);

    expect(navigateMock).toHaveBeenCalledWith('/quizzes/12345');
  });

  it('displays an alert if no quiz ID is entered', () => {
    window.alert = jest.fn();
    render(<JoinQuizForm />);
    const joinButton = screen.getByText('Join Quiz');

    fireEvent.click(joinButton);

    expect(window.alert).toHaveBeenCalledWith('Please enter a quiz ID');
  });
});
