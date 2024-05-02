import { render, screen } from '../../test-utils';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('renders ProgressBar with correct width and timeLeft', () => {
    const width = 50;
    const timeLeft = 10;

    render(<ProgressBar width={width} timeLeft={timeLeft} />);

    const progressBar = screen.getByTestId('progress-bar');
    const timeLeftText = screen.getByText(`Time left: ${timeLeft} seconds`);

    expect(progressBar).toHaveStyle(`width: ${width}%`);
    expect(timeLeftText).toBeInTheDocument();
  });
});
