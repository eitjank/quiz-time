import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthContext from '../../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

import Navbar from './Navbar';

describe('Navbar', () => {
  it('renders navbar links correctly', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{ isAuthenticated: true, logout: jest.fn() }}
        >
          <Navbar />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Join Quiz')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Signup')).toBeNull();
    expect(screen.queryByText('Login')).toBeNull();
  });

  it('renders signup and login links when not authenticated', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{ isAuthenticated: false, logout: jest.fn() }}
        >
          <Navbar />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Join Quiz')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).toBeNull();
    expect(screen.getByText('Signup')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('calls logout function when logout link is clicked', () => {
    const logoutMock = jest.fn();
    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{ isAuthenticated: true, logout: logoutMock }}
        >
          <Navbar />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Logout'));

    expect(logoutMock).toHaveBeenCalled();
  });
});
