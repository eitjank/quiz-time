import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../contexts/AuthContext';
import {
  Button,
  Container,
  Paper,
  TextInput,
  Group,
  Space,
} from '@mantine/core';

const Login = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: '',
    password: '',
  });
  const { login } = useContext(AuthContext);

  const { email, password } = inputValue;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) => {
    toast.error(err);
  };

  const handleSuccess = (msg) => {
    toast(msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { success, message } = await login(inputValue);
    if (success) {
      handleSuccess(message);
      navigate('/');
    } else {
      handleError(message);
    }

    setInputValue({
      ...inputValue,
      email: '',
      password: '',
    });
  };

  return (
    <Container>
      <Paper shadow="xs" radius="xs">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <TextInput
            type="email"
            label="Email"
            name="email"
            value={email}
            required
            placeholder="Enter your email"
            onChange={handleOnChange}
          />
          <TextInput
            type="password"
            label="Password"
            name="password"
            value={password}
            required
            placeholder="Enter your password"
            onChange={handleOnChange}
          />
          <Space h="md" />
          <Group justify="center">
            <Button type="submit">Submit</Button>
            <span>
              Don't have an account? <Link to={'/signup'}>Signup</Link>
            </span>
          </Group>
          <Space h="md" />
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
