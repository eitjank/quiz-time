import { render, screen } from '../../test-utils';
import TagSearch from './TagSearch';

describe('TagSearch', () => {
  const tags = ['tag1', 'tag2', 'tag3'];

  it('renders the MultiSelect component with the correct props', () => {
    render(
      <TagSearch tags={tags} selectedTags={[]} setSelectedTags={() => {}} />
    );

    const multiSelectComponent = screen.getByTestId('multi-select');

    expect(multiSelectComponent).toBeInTheDocument();
    expect(multiSelectComponent).toHaveAttribute('placeholder', 'Select tags');
  });
});
