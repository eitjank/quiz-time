import React from 'react';
import { Popover, ActionIcon } from '@mantine/core';
import { IconSettings, IconLogout, IconUser } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import '../Navbar.css';

const ProfilePopover = ({ offset, logout }) => {
  return (
    <Popover offset={offset}>
      <Popover.Target>
        <ActionIcon
          variant="transparent"
          className="navbar-icon"
          size="xl"
          aria-label="Profile settings"
        >
          <IconUser />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Link className="navbar-item icon" to="/profile">
          <div className="icon">
            <IconSettings style={{ marginRight: '4px' }} />
            Profile
          </div>
        </Link>
        <Link className="navbar-item icon" onClick={logout} to="/">
          <div className="icon" data-testid="logout-link">
            <IconLogout style={{ marginRight: '4px' }} />
            Logout
          </div>
        </Link>
      </Popover.Dropdown>
    </Popover>
  );
};

export default ProfilePopover;
