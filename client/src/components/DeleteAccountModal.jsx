import { Modal, Alert, Space, Group, Button } from '@mantine/core';

const DeleteAccountModal = ({ opened, close, handleAccountDeletion }) => {
  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Confirm Account Deletion"
      size="sm"
      hideCloseButton
    >
      <Alert color="red" title="Warning">
        Are you sure you want to delete your account? This action cannot be
        undone.
      </Alert>
      <Space h="md" />
      <Group justify="center">
        <Button color="red" onClick={handleAccountDeletion}>
          Confirm
        </Button>
        <Button onClick={close}>Cancel</Button>
      </Group>
    </Modal>
  );
};

export default DeleteAccountModal;
