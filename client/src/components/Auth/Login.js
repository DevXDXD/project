import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Check if the user is already authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/status', {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.isAuthenticated) {
          onLogin();
          navigate('/home');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuthStatus();
  }, [onLogin, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        onLogin();
        navigate('/home');
      } else {
        setError(data.message || 'Invalid username or password.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className={styles['login-page']}>
      <div className={styles['login-container']}>
        <h1 className={styles['title']}>Welcome to Mini-CRM</h1>
        <p className={styles['subtitle']}>Manage your customer relationships with ease.</p>
        <div className={styles['login-box']}>

          {/* Username and Password Login Form */}
          <form onSubmit={handleLogin} className={styles['login-form']}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles['login-input']}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles['login-input']}
            />
            <button type="submit" className={styles['login-btn']}>
              Login
            </button>
            {error && <div className={styles['error-message']}>{error}</div>}
          </form>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className={styles['login-with-google-btn']}
            style={{ minWidth: '200px' }}
          >
            <span style={{ fontSize: '16px' }}>Login with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
