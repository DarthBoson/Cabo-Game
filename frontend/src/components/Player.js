import React from 'react';

function Player({ player }) {
  return (
    <div className="player">
      <h3>{player.name}</h3>
    </div>
  );
}

export default Player;
