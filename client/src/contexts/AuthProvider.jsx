import React, { useEffect, useState } from 'react';
import AuthContext from './AuthContext';
import {
  AUTH_ENDPOINT,
  LOGIN_ENDPOINT,
  LOGOUT_ENDPOINT,
  SIGNUP_ENDPOINT,
} from '../api/endpoints';
import { toast } from 'react-toastify';

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch(AUTH_ENDPOINT, {
        method: 'POST',
        credentials: 'include', // Include cookies in the request
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setIsAuthenticated(data.status);
      setIsLoading(false);
      if (data.status) {
        setUsername(data.user);
      } else {
        setUsername('');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const login = async (inputValue) => {
    try {
      const res = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputValue),
        credentials: 'include',
      });
      checkAuthentication();
      const data = await res.json();
      const { success, message } = data;
      return { success, message };
    } catch (error) {
      console.error(error);
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    const response = await fetch(`${LOGOUT_ENDPOINT}`, {
      method: 'POST',
      credentials: 'include', // Include cookies in the request
    });
    if (response.ok) {
      setUsername('');
      setIsAuthenticated(false);
      toast('Logged out successfully');
    }
  };

  const signup = async (inputValue) => {
    try {
      const res = await fetch(SIGNUP_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputValue),
        credentials: 'include',
      });
      checkAuthentication();
      const data = await res.json();
      const { success, message } = data;
      return { success, message };
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, username, login, logout, signup }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
