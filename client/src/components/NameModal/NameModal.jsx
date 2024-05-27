import { Modal, TextInput, Button, Group } from '@mantine/core';

const NameModal = ({
  opened,
  close,
  name,
  setName,
  handleNameSubmit,
  generateRandomName,
}) => (
  <Modal
    opened={opened}
    onClose={close}
    title="Please enter your name"
    withCloseButton={false}
    centered
  >
    <form onSubmit={handleNameSubmit}>
      <Group direction="column">
        <TextInput
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          maxLength={25}
        />
        <Button
          onClick={() => {
            const randomName = generateRandomName();
            setName(randomName);
          }}
        >
          ↻
        </Button>
        <Button type="submit" variant="primary">
          Submit
        </Button>
      </Group>
    </form>
  </Modal>
);

export default NameModal;
