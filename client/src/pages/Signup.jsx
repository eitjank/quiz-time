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
} from '@mantine/core';
import BorderedCard from '../components/BorderedCard';

const Signup = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: '',
    password: '',
    username: '',
  });
  const { signup } = useContext(AuthContext);

  const { email, password, username } = inputValue;

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
      password: '',
      username: '',
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
          <TextInput
            className="text-input-left"
            label="Password"
            type="password"
            name="password"
            value={password}
            required
            placeholder="Enter your password"
            onChange={handleOnChange}
          />
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
