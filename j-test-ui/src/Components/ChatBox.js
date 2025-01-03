import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ImportDataSidebar from './ImportDataSidebar';
import './ChatBox.css';
import SideNav from './SideNav';
import { marked } from 'marked'; // Correct import statement

function ChatBox() {
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [userStory, setUserStory] = useState(''); // Textarea content
  const [messages, setMessages] = useState([]); // Chat messages
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // Sidebar visibility state
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null); // State for storing selected credential
  const navigate = useNavigate();

  const location = useLocation(); // Get the current location to retrieve the state
  const selectedCredentialFromState = location.state?.selectedCredential;

  useEffect(() => {
    if (selectedCredentialFromState) {
      setSelectedCredential(selectedCredentialFromState);
    }
  }, [selectedCredentialFromState]);

  const logout = () => {
    navigate('/Login');
  };

  const generateTestCases = async (userStoryData) => {
    setIsProcessing(true);
    setLoading(true);  // Start loading when API is called
    try {
      const response = await fetch('https://localhost:7216/api/UserStoryDescription/GenerateTestCases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userStory: userStoryData }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to generate test cases. Status: ${response.status}`);
      }
  
      const responseData = await response.json();
      console.log("API Response:", responseData);  // Log the entire response
  
      const candidates = responseData.candidates;
  
      if (candidates && candidates.length > 0) {
        const parts = candidates[0].content.parts;
        let markdownContent = '';
  
        if (Array.isArray(parts)) {
          markdownContent = parts.map(part => part.text).join('\n');
        }
  
        if (typeof markdownContent !== 'string') {
          throw new Error('Invalid content format');
        }
  
        const htmlContent = marked(markdownContent);  // Parse the markdown to HTML
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: htmlContent, isUserMessage: false },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'No test cases found.', isUserMessage: false },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `Error generating test cases. Error: ${error.message}`, isUserMessage: false },
      ]);
    } finally {
      setIsProcessing(false);
      setLoading(false);  // Ensure loading is set to false after the request
    }
  };  

  const handleSendMessage = () => {
    if (!userStory.trim()) return;
  
    setMessages([]);  // Clear old messages
  
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: userStory, isUserMessage: true },
    ]);
  
    setLoading(true);  // Set loading true before making the request
  
    // Refine the greeting check to only trigger on actual greetings
    if (/^\s*(hi|hello|hey)\s*$/i.test(userStory)) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Hello !, how may I help you ?', isUserMessage: false },
      ]);
      setLoading(false); // Stop the loading after sending the greeting message
      setUserStory('');  // Reset the input
      return;  // Exit the function to prevent further actions
    }
  
    // If it's not a greeting, call generateTestCases
    generateTestCases(userStory);
    setUserStory('');  // Reset the input
  };    

  const handleSelectUserStory = (story) => {
    setUserStory(story.description || '');  // Populate the description in the textarea
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);  // Toggle the sidebar visibility
  };

  return (
    <div className="chatbox-container">
      <SideNav logout={logout} />
      <div className="chat-container">
        <div className="chat-box">
          <div className="chat-box-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.isUserMessage ? 'user' : 'bot'}`}
                dangerouslySetInnerHTML={{ __html: message.text }} // Render HTML content
              />
            ))}
            {/* Display loading indicator when loading is true */}
            {loading && (
              <div className="loading-dots">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="loading-dot"></div>
                ))}
              </div>
            )}
          </div>
          <div className="chat-input-container">
            <textarea
              value={userStory}
              onChange={(e) => setUserStory(e.target.value)}
              placeholder="Type your user story or select one from the sidebar."
              rows="6"
              disabled={isProcessing}
            />
            <button onClick={handleSendMessage} disabled={isProcessing || !userStory.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Import Sidebar Button */}
      <button className="import-button" onClick={toggleSidebar}>
        &#x2190;
      </button>

      {isSidebarVisible && (
        <ImportDataSidebar
          onSelectUserStory={handleSelectUserStory}
          onClose={() => setIsSidebarVisible(false)}
          isSidebarVisible={isSidebarVisible}
          selectedCredential={selectedCredential}
        />
      )}
    </div>
  );
}

export default ChatBox;