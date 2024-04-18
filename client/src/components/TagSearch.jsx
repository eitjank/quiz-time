import { MultiSelect, Group } from '@mantine/core';

const TagSearch = ({ tags, selectedTags, setSelectedTags }) => {
  return (
    <Group justify="center">
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
      />
    </Group>
  );
};

export default TagSearch;