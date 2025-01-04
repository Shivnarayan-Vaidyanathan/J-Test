import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate and Link from react-router-dom
import './HomePage.css'; // Make sure you have a CSS file for styling
import SideNav from './SideNav'; // Import the SideNav component

function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Manage login state
  const navigate = useNavigate(); // Initialize the navigate function

  // Handle logout (simulate logout)
  const logout = () => {
    setIsAuthenticated(false);
    navigate('/Login'); // Navigate to the Login page after logout
  };

  return (
    <div className="home-container">
      {/* Render SideNav only if authenticated */}
      {isAuthenticated && <SideNav logout={logout} />} {/* Pass logout to SideNav */}

      <div className="home-content">
        <div className="home-header">
          <h1>Welcome to the Functional Test Case Generator</h1>
          <p>Generate functional test cases based on your user stories easily.</p>
        </div>

        <div className="home-description">
          <p text-align="left">
            This platform allows you to convert user stories into functional test cases,
            helping teams streamline their testing process and ensuring high-quality software.
          </p>
          <p text-align="left">
            Simply enter your user stories, and the system will generate the corresponding
            test cases for you to execute, ensuring better test coverage.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
