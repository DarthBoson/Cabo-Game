import React from 'react';
import './WaitingLobby.css';

function WaitingLobby({ players, onStartGame }) {
  const defaultProfileImage = 'assets/default_profilepic.jpeg'; // Replace with the path to your default image

  return (
  <div className="waiting-container">
    <div className="waiting-lobby">
      <h2>Waiting Lobby</h2>
      {players.length > 0 ? (
        <ul className="player-list">
          {players.map(player => (
            <li key={player.id} className="player-item">
              <img 
                src={player.profileImage || defaultProfileImage} 
                alt={`${player.name}'s profile`} 
                className="profile-image"
              />
              <span className="player-name">{player.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No players in the lobby yet.</p>
      )}
      <button onClick={onStartGame} className="start-button">
        Start Game
      </button>
    </div>
	</div>
  );
}

export default WaitingLobby;
