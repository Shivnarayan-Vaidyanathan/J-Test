import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SideNav.css';

function SideNav({ isLoggedIn, setIsLoggedIn }) {
  const [isOpen, setIsOpen] = useState(false); // State to toggle sidebar
  const navigate = useNavigate();

  // Function to toggle the side navigation visibility
  const toggleNav = () => {
    setIsOpen((prev) => !prev);
  };

  // Navigation handlers
  const goToHome = () => {
    setIsOpen(false); // Close the side nav after navigation
    navigate('/HomePage');
  };

  const goToChat = () => {
    setIsOpen(false);
    navigate('/ChatBox');
  };

  const goToSettings = () => {
    setIsOpen(false);
    navigate('/Settings');
  };

  // Logout handler
  const logout = () => {
    setIsLoggedIn(false);
    setIsOpen(false); // Close the nav on logout
    navigate('/Login'); // Redirect to login page
  };

  // Render side nav only if the user is logged in
  return (
    isLoggedIn && (
      <div className="side-nav-container">
        {/* Side Navigation */}
        <div className={`side-nav ${isOpen ? 'open' : ''}`}>
          <ul>
            <li>
              <button onClick={goToHome}>Home</button>
            </li>
            <li>
              <button onClick={goToChat}>Chat</button>
            </li>
            <li>
              <button onClick={goToSettings}>Settings</button>
            </li>
            <li>
              <button onClick={logout}>Logout</button>
            </li>
          </ul>
        </div>

        {/* Toggle Button */}
        <div
          className={`arrow ${isOpen ? 'rotate' : ''}`}
          onClick={toggleNav}
        >
          &#x2192;
        </div>
      </div>
    )
  );
}

export default SideNav;