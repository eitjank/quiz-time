import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../contexts/AuthContext';
import {
  Button,
  Container,
  TextInput,
  Group,
  Title,
  PasswordInput,
  Text,
  Box,
  rem,
  Progress,
  Popover,
} from '@mantine/core';
import { IconX, IconCheck } from '@tabler/icons-react';
import BorderedCard from '../components/BorderedCard/BorderedCard';

function PasswordRequirement({ meets, label }) {
  return (
    <Text
      c={meets ? 'teal' : 'red'}
      style={{ display: 'flex', alignItems: 'center' }}
      mt={7}
      size="sm"
    >
      {meets ? (
        <IconCheck style={{ width: rem(14), height: rem(14) }} />
      ) : (
        <IconX style={{ width: rem(14), height: rem(14) }} />
      )}{' '}
      <Box ml={10}>{label}</Box>
    </Text>
  );
}

const requirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

const lengthRequirement = { re: /.{8,}/, label: 'At least 8 characters' };

const allRequirements = [lengthRequirement, ...requirements];

function getStrength(password) {
  let multiplier = 0;

  allRequirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  if (!lengthRequirement.re.test(password))
    return Math.max(50 - (50 / (allRequirements.length + 1)) * multiplier, 10);

  return Math.max(100 - (100 / (allRequirements.length + 1)) * multiplier, 10);
}

const Signup = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: '',
    username: '',
    password: '',
  });
  const { signup } = useContext(AuthContext);
  const [popoverOpened, setPopoverOpened] = useState(false);

  const { email, username, password } = inputValue;

  const checks = allRequirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(password)}
    />
  ));

  const strength = getStrength(password);
  const color = strength > 50 ? 'teal' : 'red';

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) => toast.error(err);

  const handleSuccess = (msg) => toast(msg);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !username || !password)
      return handleError('Please fill in all fields');

    if (password.length < 8)
      return handleError('Password must be at least 8 characters');

    if (strength <= 50) return handleError('Password is too weak');

    const { success, message } = await signup(inputValue);
    if (success) {
      handleSuccess(message);
      navigate('/');
    } else {
      handleError(message);
    }

    setInputValue({
      ...inputValue,
      email: '',
      username: '',
      password: '',
    });
  };

  return (
    <Container>
      <BorderedCard>
        <Title order={2}>Signup</Title>
        <form onSubmit={handleSubmit}>
          <TextInput
            className="text-input-left"
            label="Email"
            type="email"
            name="email"
            value={email}
            required
            placeholder="Enter your email"
            onChange={handleOnChange}
          />
          <TextInput
            className="text-input-left"
            label="Username"
            type="text"
            name="username"
            value={username}
            required
            placeholder="Enter your username"
            onChange={handleOnChange}
          />
          <Popover
            opened={popoverOpened}
            position="bottom"
            width="target"
            transitionProps={{ transition: 'pop' }}
          >
            <Popover.Target>
              <div
                onFocusCapture={() => setPopoverOpened(true)}
                onBlurCapture={() => setPopoverOpened(false)}
              >
                <PasswordInput
                  className="text-input-left"
                  label="Password"
                  name="password"
                  required
                  value={password}
                  placeholder="Enter your password"
                  onChange={handleOnChange}
                />
              </div>
            </Popover.Target>
            <Popover.Dropdown>
              <Progress color={color} value={strength} size={5} mb="xs" />
              {checks}
            </Popover.Dropdown>
          </Popover>
          <Group justify="center">
            <Button type="submit">Submit</Button>
            <span>
              Already have an account? <Link to={'/login'}>Login</Link>
            </span>
          </Group>
        </form>
      </BorderedCard>
    </Container>
  );
};

export default Signup;
