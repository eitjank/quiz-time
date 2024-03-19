import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { useCookies } from 'react-cookie';
import { AUTH_ENDPOINT } from '../../api/endpoints';

const Navbar = () => {
  const [cookies, , removeCookie] = useCookies(['token']);
  const [username, setUsername] = useState('');

  const Logout = async () => {
    removeCookie('token');
    console.log(username);
    setUsername('');
  };

  useEffect(() => {
    if (!cookies.token) return;
    console.log(cookies.token);
    const verifyCookie = async () => {
      const response = await fetch(AUTH_ENDPOINT, {
        method: 'POST',
        credentials: 'include', // Include cookies in the request
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status) {
        setUsername(data.user);
      } else {
        removeCookie('token');
        setUsername('');
      }
    };
    verifyCookie();
  }, [cookies, removeCookie]);

  return (
    <nav className="navbar">
      <Link className="navbar-item" to="/">
        Home
      </Link>
      <Link className="navbar-item" to="/join">
        Join Quiz
      </Link>
      {cookies.token ? ( // If the user is logged in
        <>
          <Link className="navbar-item" onClick={Logout} to="/">
            Logout
          </Link>
        </>
      ) : (
        <>
          <Link className="navbar-item" to="/signup">
            Signup
          </Link>
          <Link className="navbar-item" to="/login">
            Login
          </Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
