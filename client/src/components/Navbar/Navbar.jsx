import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import AuthContext from '../../contexts/AuthContext';
import {
  IconLogin,
  IconLogout,
  IconSettings,
  IconUserPlus,
} from '@tabler/icons-react';
import { Popover, Avatar } from '@mantine/core';

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
          <Popover offset={13}>
            <Popover.Target>
              <Avatar
                src={null}
                alt="User avatar"
                style={{ cursor: 'pointer' }}
                color="blue"
                size={35}
              />
            </Popover.Target>
            <Popover.Dropdown>
              <Link className="navbar-item icon" to="/profile">
                <div className="icon">
                  <IconSettings style={{ marginRight: '4px' }} />
                  Profile
                </div>
              </Link>
              <Link className="navbar-item icon" onClick={logout} to="/">
                <div className="icon">
                  <IconLogout style={{ marginRight: '4px' }} />
                  Logout
                </div>
              </Link>
            </Popover.Dropdown>
          </Popover>
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
    </nav>
  );
};

export default Navbar;
