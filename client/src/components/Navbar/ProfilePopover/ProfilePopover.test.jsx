import { render, screen } from '../../../test-utils';
import ProfilePopover from './ProfilePopover';

it('renders ProfilePopover component', () => {
  render(<ProfilePopover offset={10} logout={jest.fn()} />);

  const profileSettingsIcon = screen.getByLabelText('Profile settings');
  expect(profileSettingsIcon).toBeInTheDocument();
});
