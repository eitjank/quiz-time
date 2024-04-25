import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import AuthContext from '../../contexts/AuthContext';
import { IconLogin, IconUserPlus } from '@tabler/icons-react';
import { Popover } from '@mantine/core';
import ColorSchemeToggle from './ColorSchemeToggle/ColorSchemeToggle';
import ProfilePopover from './ProfilePopover/ProfilePopover';

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <Link className="navbar-item" to="/">
        Join Quiz
      </Link>
      <Link className="navbar-item" to="/quizzes">
        Quizzes
      </Link>
      {isAuthenticated ? (
        <>
          <Link className="navbar-item" to="/myQuizzes">
            My Quizzes
          </Link>
          <Link className="navbar-item" to="/questionBank">
            My Question Bank
          </Link>
          <ProfilePopover logout={logout} />
        </>
      ) : (
        <>
          <Popover offset={13}>
            <Popover.Target>
              <div className="navbar-item" style={{ cursor: 'pointer' }}>
                Join
              </div>
            </Popover.Target>
            <Popover.Dropdown>
              <Link className="navbar-item" to="/signup">
                <div className="icon">
                  <IconUserPlus style={{ marginRight: '4px' }} />
                  Signup
                </div>
              </Link>
              <Link className="navbar-item" to="/login">
                <div className="icon">
                  <IconLogin style={{ marginRight: '4px' }} />
                  Login
                </div>
              </Link>
            </Popover.Dropdown>
          </Popover>
        </>
      )}
      <ColorSchemeToggle />
    </nav>
  );
};

export default Navbar;
