import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo1 from './Gemini.webp';  // Adjust the path to your image

function LoginPage({ login }) { // Updated to receive `login` as a prop
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://localhost:7216/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Login successful:', result);

        // Call the `login` function to update authentication state
        login(); 
        navigate('/HomePage'); // Navigate to the HomePage
      } else {
        const message = await response.text();
        setError(message || 'Failed to login');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred while logging in. Please try again later.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleLogin}>
        <div>
          <label>
            Email: <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Password: <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <a href="/Signup">Sign up</a>
      </p>
      <h2>Powered by</h2>
      <div className="logo-container">
        <img src={logo1} alt="Gemini Logo" width={200} height={120} className="logo1" />
      </div>
    </div>
  );
}

export default LoginPage;