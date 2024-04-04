import React, { useState, useEffect } from 'react';
import { USER_ENDPOINT } from '../api/endpoints';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

const Profile = () => {
  const { logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

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
        toast.success(data.message);
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
        toast.success(data.message);
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
        toast.success(data.message);
      })
      .catch((err) => console.error(err));
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{user.username}'s Profile</h1>
      <p>Email: {user.email}</p>

      <h2>Update Profile</h2>
      <form onSubmit={handleUsernameUpdate}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <button type="submit">Update Username</button>
      </form>

      <h2>Change Password</h2>
      <form onSubmit={handlePasswordChange}>
        <label>
          Current Password:
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>
        <label>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <button type="submit">Change Password</button>
      </form>

      <button onClick={handleAccountDeletion}>Delete Account</button>
    </div>
  );
};

export default Profile;
