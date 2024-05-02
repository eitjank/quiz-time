import { render, screen } from '../../test-utils';
import OptionsList from './OptionsList';

it('renders OptionsList and checks options', () => {
  const options = ['Option 1', 'Option 2', 'Option 3'];

  render(<OptionsList options={options} />);

  options.forEach((option) => {
    const optionElement = screen.getByText(option);
    expect(optionElement).toBeInTheDocument();
  });
});
