import { MultiSelect } from '@mantine/core';

const TagSearch = ({ tags, selectedTags, setSelectedTags }) => {
  return (
    <MultiSelect
      data={tags}
      multiple
      label="Search by tags"
      placeholder="Select tags"
      value={selectedTags}
      onChange={setSelectedTags}
      searchable
      hidePickedOptions
      maxDropdownHeight={200}
      style={{ width: '100%' }}
      data-testid="multi-select"
    />
  );
};

export default TagSearch;
