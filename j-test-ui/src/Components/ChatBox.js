import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ImportDataSidebar from './ImportDataSidebar';
import './ChatBox.css';
import SideNav from './SideNav';
import { marked } from 'marked'; // Correct import statement
import htmlDocx from 'html-docx-js/dist/html-docx'; // Import html-docx-js

function ChatBox() {
  const [loading, setLoading] = useState(false);
  const [userStory, setUserStory] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
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
    setLoading(true);
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
      setLoading(false);
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

    if (/^\s*(hi|hello|hey)\s*$/i.test(userStory)) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Hello !, how may I help you ?', isUserMessage: false },
      ]);
      setLoading(false);
      setUserStory('');
      return;
    }

    generateTestCases(userStory);
    setUserStory('');
  };

  const handleSelectUserStory = (story) => {
    setUserStory(story.description || '');
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handleExportToWord = () => {
    // Filter only bot messages and prepare them as a table
    const botMessages = messages.filter(msg => !msg.isUserMessage);
  
    if (botMessages.length === 0) {
      alert('No bot messages to export.');
      return;
    }
  
    let tableContent = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #000000; padding: 8px; text-align: left;">Message #</th>
            <th style="border: 1px solid #000000; padding: 8px; text-align: left;">Sender</th>
            <th style="border: 1px solid #000000; padding: 8px; text-align: left;">Content</th>
          </tr>
        </thead>
        <tbody>`;
  
    botMessages.forEach((msg, index) => {
      tableContent += `
        <tr>
          <td style="border: 1px solid #000000; padding: 8px;">${index + 1}</td>
          <td style="border: 1px solid #000000; padding: 8px;">Bot</td>
          <td style="border: 1px solid #000000; padding: 8px;">${msg.text}</td>
        </tr>`;
    });
  
    tableContent += `</tbody></table>`;
  
    // Convert HTML to DOCX directly
    const convertedDoc = htmlDocx.asBlob(tableContent);
  
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(convertedDoc);
    link.download = 'Functional Test Cases.docx';  // Default file name
    link.click();  // Trigger the download prompt
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
                dangerouslySetInnerHTML={{ __html: message.text }}
              />
            ))}
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
            {/* Export Button */}
            <button id="export-word" onClick={handleExportToWord} disabled={messages.filter(msg => !msg.isUserMessage).length === 0 }>
              Export
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