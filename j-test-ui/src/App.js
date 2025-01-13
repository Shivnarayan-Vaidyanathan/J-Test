import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import LoginPage from './Components/Login';
import SignupPage from './Components/Signup';
import SideNav from './Components/SideNav';
import ChatBox from './Components/ChatBox';
import HomePage from './Components/HomePage';
import Settings from './Components/Settings';  // Import the Settings component

import logo from './J-Test.png';  // Adjust the path to your image
import logo1 from './Gemini.webp';  // Adjust the path to your image

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Handle login success
  const login = () => {
    setIsAuthenticated(true);  // Set the authenticated state
    navigate('/HomePage');  // Redirect to HomePage after successful login
  };

  return (
    <div className="App">
      {/* Use the logo class to style the image */}
      <img src={logo} alt="J-Test Logo" className="logo" />

      {isAuthenticated && <SideNav isLoggedIn={isAuthenticated} setIsLoggedIn={setIsAuthenticated} />}

      <Routes>
        <Route path="/Login" element={<LoginPage login={login} />} />
        <Route path="/Signup" element={<SignupPage />} />
        <Route path="/HomePage" element={isAuthenticated ? <HomePage /> : <Navigate to="/Login" />} />
        <Route path="/ChatBox" element={isAuthenticated ? <ChatBox /> : <Navigate to="/Login" />} />
        <Route path="/Settings" element={isAuthenticated ? <Settings /> : <Navigate to="/Login" />} />
        <Route path="/" element={<Navigate to="/Login" />} />
      </Routes>
      <h2>Powered by</h2>
      <img src={logo1} alt="Gemini Logo" width={200} height={120} className="logo1" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;