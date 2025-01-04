import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

function Settings() {
  const [domain, setDomain] = useState('');
  const [username, setJiraUsername] = useState('');
  const [apiToken, setJiraApiToken] = useState('');
  const [locked, setLocked] = useState(true);
  const [details, setDetails] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [checkedDetails, setCheckedDetails] = useState([]); // Track selected details
  const [checkedCredentials, setCheckedCredentials] = useState([]); // Track selected credentials
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  // Fetch details from the server
  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://localhost:7216/api/Auth/details');
      if (!response.ok) {
        throw new Error('Failed to fetch credentials');
      }
      const data = await response.json();
      setDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  // Fetch credentials from the server
  const fetchCredentials = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://localhost:7216/api/Auth/credentials');
      if (!response.ok) {
        throw new Error('Failed to fetch credentials');
      }
      const data = await response.json();
      setCredentials(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  // Toggle the locked/unlocked state of input fields
  const handleLockToggle = () => {
    setLocked(!locked);
  };

  // Delete a detail
  const handleDeleteDetail = async (id) => {
    try {
      const response = await fetch(`https://localhost:7216/api/Auth/detail/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setDetails(details.filter((cred) => cred.id !== id));
        setCheckedDetails([]); // Reset checked details after deletion
      } else {
        throw new Error('Failed to delete credential');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a credential
  const handleDeleteCredential = async (id) => {
    try {
      const response = await fetch(`https://localhost:7216/api/Auth/credential/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCredentials(credentials.filter((cred) => cred.id !== id));
        setCheckedCredentials([]); // Reset checked credentials after deletion
      } else {
        throw new Error('Failed to delete credential');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle checkbox changes for details
  const handleCheckboxChangeDetail = (id) => {
    if (checkedDetails.includes(id)) {
      setCheckedDetails(checkedDetails.filter((checkboxId) => checkboxId !== id));
    } else {
      setCheckedDetails([...checkedDetails, id]);
    }
  };

  // Handle checkbox changes for credentials
  const handleCheckboxChangeCredential = (id) => {
    if (checkedCredentials.includes(id)) {
      setCheckedCredentials(checkedCredentials.filter((checkboxId) => checkboxId !== id));
    } else {
      setCheckedCredentials([...checkedCredentials, id]);
    }
  };

  // Save the new credentials
  const handleSave = async () => {
    if (!domain || !username || !apiToken) {
      setError('All fields are required.');
      return;
    }

    const newCredential = { domain, username, apiToken };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://localhost:7216/api/Auth/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCredential),
      });

      if (!response.ok) {
        throw new Error('Failed to save credential');
      }

      const savedCredential = await response.json();
      setDetails([...details, savedCredential]);
      setDomain('');
      setJiraUsername('');
      setJiraApiToken('');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle the "Load" action
  const handleLoad = () => {
    console.log("Selected Credentials:", checkedDetails); // Debugging log
    if (checkedDetails.length === 1) {
      const selectedCredential = details.find((cred) => checkedDetails.includes(cred.id));
      if (selectedCredential) {
        navigate('/chatbox', { state: { selectedCredential } });
      } else {
        setError('No credential selected or invalid selection.');
      }
    } else {
      setError('Please select exactly one credential to load.');
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      {error && <div className="error">{error}</div>}

      <div className="credentials-form">
        <div className="field">
          <label>Domain</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={locked}
          />
        </div>

        <div className="field">
          <label>Jira Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setJiraUsername(e.target.value)}
            disabled={locked}
          />
        </div>

        <div className="field">
          <label>Jira API Token</label>
          <input
            type="password"
            value={apiToken}
            onChange={(e) => setJiraApiToken(e.target.value)}
            disabled={locked}
          />
        </div>

        <div className="button-container">
          <div className="lock-checkbox">
            <input
              type="checkbox"
              checked={!locked}
              onChange={handleLockToggle}
            />
            <label>{locked ? '' : ''}</label>
          </div>

          <button className="save-button" onClick={handleSave} disabled={locked}>
            Save
          </button>

          <button
            className="load-button"
            onClick={handleLoad}
            disabled={checkedDetails.length !== 1} // Disable until one checkbox is selected
          >
            Load
          </button>
        </div>
      </div>

      <div className="credentials-list">
        <h3>Stored Credentials</h3>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-container">
            <table className="credentials-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Domain</th>
                  <th>Username</th>
                  <th>ApiToken</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {details.map((cred) => (
                  <tr key={cred.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checkedDetails.includes(cred.id)}
                        onChange={() => handleCheckboxChangeDetail(cred.id)}
                      />
                    </td>
                    <td>{cred.domain}</td>
                    <td>{cred.username}</td>
                    <td>{cred.apiToken ? `${cred.apiToken.slice(0, 0)}****` : 'No Token'}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteDetail(cred.id)}
                        disabled={!checkedDetails.includes(cred.id)} // Enable delete only for selected credential
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="Signup-list">
        <h3>Stored Sign-ups</h3>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-container">
            <table className="credentials-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {credentials.map((cred) => (
                  <tr key={cred.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checkedCredentials.includes(cred.id)}
                        onChange={() => handleCheckboxChangeCredential(cred.id)}
                      />
                    </td>
                    <td>{cred.email}</td>
                    <td>{cred.password ? `${cred.password.slice(0, 0)}****` : 'No Password'}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteCredential(cred.id)}
                        disabled={!checkedCredentials.includes(cred.id)} // Enable delete only for selected credential
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;