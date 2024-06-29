import React, { useState } from 'react';
import './LoginPage.css'; // Import the CSS for styling

function LoginPage({ onLogin }) {
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const handleLogin = () => {
    if (name && profileImage) {
      onLogin(name, profileImage);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
	    <h1>Cabo Card Game</h1>
		<p>Cabo is a fast-paced card game that combines memory, strategy, and a bit of luck. Designed for arbitrary number of players, the objective is to have the lowest score by the end of the game. Easy to learn yet challenging to master, Cabo is perfect for family game nights and friendly gatherings, or to make and break friendships.</p>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Enter your username"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter your profile image URL"
          value={profileImage}
          onChange={(e) => setProfileImage(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default LoginPage;
