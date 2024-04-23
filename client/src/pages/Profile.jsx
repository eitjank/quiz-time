import React, { useState, useEffect } from 'react';
import { USER_ENDPOINT } from '../api/endpoints';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import { Button, Container, Paper, Space, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import DeleteAccountModal from '../components/DeleteAccountModal';

const Profile = () => {
  const { logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    fetch(`${USER_ENDPOINT}/currentUser`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setUsername(data.username);
      })
      .catch((err) => console.error(err));
  }, []);

  const handlePasswordChange = (event) => {
    event.preventDefault();
    fetch(`${USER_ENDPOINT}/changePassword`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to change password');
        }
        return res.json();
      })
      .then((data) => {
        toast(data.message);
        setCurrentPassword('');
        setNewPassword('');
      })
      .catch((err) => console.error(err));
  };

  const handleUsernameUpdate = (event) => {
    event.preventDefault();
    fetch(`${USER_ENDPOINT}/updateUsername`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to update username');
        }
        return res.json();
      })
      .then((data) => {
        setUser((prevUser) => ({ ...prevUser, username: data.username }));
        toast(data.message);
      })
      .catch((err) => console.error(err));
  };

  const handleAccountDeletion = () => {
    fetch(`${USER_ENDPOINT}/deleteAccount`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        logout();
        navigate('/');
        toast(data.message);
      })
      .catch((err) => console.error(err));
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Paper shadow="md">
        <h1>{user.username}'s Profile</h1>
        <h4>Email: {user.email}</h4>

        <h2>Update Profile</h2>
        <form onSubmit={handleUsernameUpdate}>
          <TextInput
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Space h="lg" />
          <Button type="submit">Update Username</Button>
        </form>

        <h2>Change Password</h2>
        <form onSubmit={handlePasswordChange}>
          <TextInput
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextInput
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Space h="lg" />
          <Button type="submit">Change Password</Button>
        </form>
        <Space h="xl" />
        <Button onClick={open}>Delete Account</Button>
        <DeleteAccountModal
          opened={opened}
          close={close}
          handleAccountDeletion={handleAccountDeletion}
        />
      </Paper>
    </Container>
  );
};

export default Profile;
