import { render, screen, fireEvent } from '../../test-utils';
import DeleteAccountModal from './DeleteAccountModal';

describe('DeleteAccountModal', () => {
  it('renders the modal with the correct title and warning message', () => {
    render(
      <DeleteAccountModal
        opened={true}
        close={() => {}}
        handleAccountDeletion={() => {}}
      />
    );

    const titleElement = screen.getByTestId('delete-account-modal');
    const warningElement = screen.getByTestId('deletion-warning');

    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent(/confirm/i);
    expect(warningElement).toBeInTheDocument();
    expect(warningElement).toHaveTextContent(/are you sure/i);
  });

  it('calls the handleAccountDeletion function when the Confirm button is clicked', () => {
    const handleAccountDeletionMock = jest.fn();

    render(
      <DeleteAccountModal
        opened={true}
        close={() => {}}
        handleAccountDeletion={handleAccountDeletionMock}
      />
    );

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    expect(handleAccountDeletionMock).toHaveBeenCalledTimes(1);
  });

  it('calls the close function when the Cancel button is clicked', () => {
    const closeMock = jest.fn();

    render(
      <DeleteAccountModal
        opened={true}
        close={closeMock}
        handleAccountDeletion={() => {}}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
