import { render, screen } from '../../test-utils';
import QuestionAnswer from './QuestionAnswer';

it('renders QuestionAnswer component with answer', () => {
  const question = {
    answer: ['Option 1', 'Option 2', 'Option 3'],
  };

  render(<QuestionAnswer question={question} />);

  const answerElement = screen.getByText(
    'Answer: Option 1, Option 2, Option 3'
  );
  expect(answerElement).toBeInTheDocument();
});

it('renders QuestionAnswer component without answer', () => {
  const question = {
    answer: null,
  };

  render(<QuestionAnswer question={question} />);

  const answerElement = screen.queryByText('Answer:');
  expect(answerElement).toBeNull();
});
