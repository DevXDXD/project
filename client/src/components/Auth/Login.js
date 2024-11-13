import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css'; // Import CSS module

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

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

  return (
    <div className={styles['login-page']}>
      <div className={styles['login-container']}>
        <h1 className={styles['title']}>Welcome to Mini-CRM</h1>
        <p className={styles['subtitle']}>Manage your customer relationships with ease.</p>
        <div className={styles['login-box']}>
          <button
            onClick={handleGoogleLogin}
            className={styles['login-with-google-btn']}
            style={{ minWidth: '200px' }} // Adjusted min width for better button size
          >
            <span style={{ fontSize: '16px' }}>Login with Google</span> {/* Increased font size */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
