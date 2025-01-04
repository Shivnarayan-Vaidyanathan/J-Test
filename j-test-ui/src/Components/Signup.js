import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('https://localhost:7216/api/Auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        alert('Account created successfully');
        navigate('/Login'); // Navigate to the login page
      } else {
        const message = await response.text();
        setError(message || 'Failed to create account');
      }
    } catch (err) {
      setError('An error occurred while signing up. Please try again later.');
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSignup}>
        <div>
          <label>Email: <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          /></label>
        </div>
        <div>
          <label>Password: <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          /></label>
        </div>
        <div>
          <label>Confirm Password: <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          /></label>
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <a href="/Login">Log in</a>
      </p>
    </div>
  );
}

export default SignupPage;