import { render, screen } from '../../test-utils';
import BorderedCard from './BorderedCard';

it('renders BorderedCard component with children', () => {
  render(
    <BorderedCard>
      <div>Child Component 1</div>
      <div>Child Component 2</div>
    </BorderedCard>
  );

  const childComponent1 = screen.getByText('Child Component 1');
  const childComponent2 = screen.getByText('Child Component 2');

  expect(childComponent1).toBeInTheDocument();
  expect(childComponent2).toBeInTheDocument();
});

it('applies custom styles to BorderedCard component', () => {
  const customStyle = {
    backgroundColor: 'red',
    color: 'white',
  };

  render(
    <BorderedCard style={customStyle}>
      <div>Child Component</div>
    </BorderedCard>
  );

  const borderedCard = screen.getByTestId('bordered-card');

  expect(borderedCard).toHaveStyle('background-color: red');
  expect(borderedCard).toHaveStyle('color: white');
});
