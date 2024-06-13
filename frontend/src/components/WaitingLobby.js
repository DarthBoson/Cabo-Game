import React from 'react';
import './WaitingLobby.css';

function WaitingLobby({ players, onStartGame }) {
  return (
    <div className="waiting-lobby">
      <h2>Waiting Lobby</h2>
      <ul>
        {players.map(player => (
          <li key={player.id}>
            <img src={player.profileImage} alt={`${player.name}'s profile`} />
            {player.name}
          </li>
        ))}
      </ul>
      <button onClick={onStartGame}>Start Game</button>
    </div>
  );
}

export default WaitingLobby;
