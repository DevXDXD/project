import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Home from './pages/Home';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('Checking authentication status...');
        const response = await fetch('http://localhost:5000/api/auth/status', {
          credentials: 'include'
        });
        console.log('Response from auth status:', response);
        const data = await response.json();
        console.log('Authentication data:', data);
        setIsAuthenticated(data.isAuthenticated);
        setLoading(false);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      console.log('Initiating logout...');
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include credentials if using sessions/cookies
      });
      console.log('Response from logout:', response);
      if (response.ok) {
        console.log('Logout successful');
        setIsAuthenticated(false); // Update React state after successful logout
      } else {
        console.error('Logout failed:', await response.text());
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    console.log('Loading...');
    return <div>Loading...</div>;
  }

  console.log('Rendering main app...');

  return (
    <Router>
      <div>
        <Routes>
          <Route
            path="/login"
            element={<Login onLogin={() => setIsAuthenticated(true)} />}
          />
          <Route
            path="/home/*"
            element={isAuthenticated ? <Home onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;