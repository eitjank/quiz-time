import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link className="navbar-item" to="/">Home</Link>
      <Link className="navbar-item" to="/join">Join Quiz</Link>
    </nav>
  );
};

export default Navbar;