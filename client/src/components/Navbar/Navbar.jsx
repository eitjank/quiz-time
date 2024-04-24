import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import AuthContext from '../../contexts/AuthContext';
import { IconLogin, IconLogout } from '@tabler/icons-react';

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <Link className="navbar-item" to="/">
        Home
      </Link>
      <Link className="navbar-item" to="/join">
        Join Quiz
      </Link>
      {isAuthenticated ? (
        <>
          <Link className="navbar-item" to="/questionBank">
            My Question Bank
          </Link>
          <Link className="navbar-item" to="/myQuizzes">
            My Quizzes
          </Link>
          <Link className="navbar-item" to="/profile">
            Profile
          </Link>
          <Link className="navbar-item logout-link" onClick={logout} to="/">
            Logout
            <IconLogout style={{ marginLeft: '8px' }} />
          </Link>
        </>
      ) : (
        <>
          <Link className="navbar-item" to="/signup">
            Signup
          </Link>
          <Link className="navbar-item logout-link" to="/login">
            Login
            <IconLogin style={{ marginLeft: '8px' }} />
          </Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
