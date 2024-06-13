import React, { useEffect, useState } from 'react';
import Player from './Player';
import Card from './Card';

function GameBoard({ username, socket }) {
  const [gameState, setGameState] = useState({ players: [], cards: [] });

  useEffect(() => {
    socket.on('gameUpdate', (data) => {
      setGameState(data);
    });

    // Clean up on unmount
    return () => socket.off('gameUpdate');
  }, [socket]);

  return (
    <div className="game-board">
      <h2>Game Board</h2>
      <div className="players">
        {gameState.players.map((player, index) => (
          <Player key={index} player={player} />
        ))}
      </div>
      <div className="cards">
        {gameState.cards.map((card, index) => (
          <Card key={index} card={card} />
        ))}
      </div>
    </div>
  );
}

export default GameBoard;
