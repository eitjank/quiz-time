import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import AuthContext from '../../contexts/AuthContext';

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
          <Link className="navbar-item" to="/myQuizzes">
            My Quizzes
          </Link>
          <Link className="navbar-item" to="/profile">
            Profile
          </Link>
          <Link className="navbar-item" onClick={logout} to="/">
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
