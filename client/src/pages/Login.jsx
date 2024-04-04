import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: '',
    password: '',
  });
  const { login } = useContext(AuthContext);
  
  const { email, password } = inputValue;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) => {
    toast.error(err, {
      position: 'bottom-left',
    });
  };

  const handleSuccess = (msg) => {
    toast(msg, {
      position: 'bottom-left',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { success, message } = await login(inputValue);
    if (success) {
      handleSuccess(message);
      navigate('/');
    } else {
      handleError(message);
    }

    setInputValue({
      ...inputValue,
      email: '',
      password: '',
    });
  };

  return (
    <div className="form_container">
      <h2>Login Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            placeholder="Enter your email"
            onChange={handleOnChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            placeholder="Enter your password"
            onChange={handleOnChange}
          />
        </div>
        <button type="submit">Submit</button>
        <span>
          Don't have an account? <Link to={'/signup'}>Signup</Link>
        </span>
      </form>
    </div>
  );
};

export default Login;
