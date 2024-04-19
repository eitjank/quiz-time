import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../contexts/AuthContext';
import { Button, Container, Paper, TextInput, Group } from '@mantine/core';

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

  const handleError = (err) =>
    toast.error(err, {
      position: 'bottom-left',
    });

  const handleSuccess = (msg) =>
    toast(msg, {
      position: 'bottom-right',
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { success, message } = await signup(inputValue);
    if (success) {
      handleSuccess(message);
      setTimeout(() => {
        navigate('/');
      }, 1000);
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
      <Paper shadow="xs" radius="md">
        <h2>Signup</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <TextInput
              label="Email"
              type="email"
              name="email"
              value={email}
              required
              placeholder="Enter your email"
              onChange={handleOnChange}
            />
          </div>
          <div>
            <TextInput
              label="Username"
              type="text"
              name="username"
              value={username}
              required
              placeholder="Enter your username"
              onChange={handleOnChange}
            />
          </div>
          <div>
            <TextInput
              label="Password"
              type="password"
              name="password"
              value={password}
              required
              placeholder="Enter your password"
              onChange={handleOnChange}
            />
          </div>
          <Group justify="center">
            <Button type="submit">Submit</Button>
            <span>
              Already have an account? <Link to={'/login'}>Login</Link>
            </span>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default Signup;
