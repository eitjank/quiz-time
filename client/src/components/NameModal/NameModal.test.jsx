import { render, screen, fireEvent } from '../../test-utils';
import NameModal from './NameModal';

describe('NameModal', () => {
  it('renders the modal with the correct title', () => {
    render(
      <NameModal
        opened={true}
        close={() => {}}
        name=""
        setName={() => {}}
        handleNameSubmit={() => {}}
        generateRandomName={() => {}}
      />
    );

    const titleElement = screen.getByText('Please enter your name');
    expect(titleElement).toBeInTheDocument();
  });

  it('updates the name when the input value changes', () => {
    const setNameMock = jest.fn();
    render(
      <NameModal
        opened={true}
        close={() => {}}
        name=""
        setName={setNameMock}
        handleNameSubmit={() => {}}
        generateRandomName={() => {}}
      />
    );

    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'John' } });

    expect(setNameMock).toHaveBeenCalledWith('John');
  });

  it('calls the handleNameSubmit function when the form is submitted', () => {
    const handleNameSubmitMock = jest.fn();
    render(
      <NameModal
        opened={true}
        close={() => {}}
        name=""
        setName={() => {}}
        handleNameSubmit={handleNameSubmitMock}
        generateRandomName={() => {}}
      />
    );

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    expect(handleNameSubmitMock).toHaveBeenCalled();
  });

  it('calls the generateRandomName function and updates the name when the "↻" button is clicked', () => {
    const generateRandomNameMock = jest.fn(() => 'Random Name');
    const setNameMock = jest.fn();
    render(
      <NameModal
        opened={true}
        close={() => {}}
        name=""
        setName={setNameMock}
        handleNameSubmit={() => {}}
        generateRandomName={generateRandomNameMock}
      />
    );

    const randomNameButton = screen.getByText('↻');
    fireEvent.click(randomNameButton);

    expect(generateRandomNameMock).toHaveBeenCalled();
    expect(setNameMock).toHaveBeenCalledWith('Random Name');
  });
});
