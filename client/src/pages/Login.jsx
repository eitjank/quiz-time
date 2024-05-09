import React, { useContext, useState } from 'react';
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
} from '@mantine/core';
import BorderedCard from '../components/BorderedCard/BorderedCard';

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
      <BorderedCard>
        <Title order={2}>Login</Title>
        <form onSubmit={handleSubmit}>
          <TextInput
            className="text-input-left"
            type="email"
            label="Email"
            name="email"
            value={email}
            required
            placeholder="Enter your email"
            onChange={handleOnChange}
          />
          <PasswordInput
            className="text-input-left"
            label="Password"
            name="password"
            value={password}
            required
            placeholder="Enter your password"
            onChange={handleOnChange}
          />
          <Group justify="center">
            <Button type="submit">Submit</Button>
            <span>
              Don't have an account? <Link to={'/signup'}>Signup</Link>
            </span>
          </Group>
        </form>
      </BorderedCard>
    </Container>
  );
};

export default Login;
