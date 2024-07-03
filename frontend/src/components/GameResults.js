import React from 'react';
import { useLocation } from 'react-router-dom';
import './GameResults.css';

const calculateScore = (cards) => {
  const values = {
    'Jok': -1,
    'A': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12,
    'KS': 13,
    'KC': 13,
    'KD': 0,
    'KH': 0,
  };
  return cards.reduce((total, card) => total + (values[card.slice(0, -1)] || 0), 0);
};

const GameResults = () => {
  const location = useLocation();
  const { players } = location.state || []; // Ensure players is defined
  
  const datastuff = players.players
  
  console.log(datastuff);
  
  const sortedPlayers = [...datastuff].sort((a, b) => calculateScore(b.cards) - calculateScore(a.cards));
  
  if (!datastuff || !Array.isArray(datastuff)) {
    return <div className="game-results">Loading...</div>;
  }

  return (
  <div className="game-results-container">
    <div className="game-results">
      <h2>Game Results</h2>
      <div className="results-grid">
        {sortedPlayers.map((player, index) => (
          <div key={index} className="player-result">
            <img src={player.profileImage} alt={`${player.name}'s profile`} />
            <h3>{player.name}</h3>
            <p>Score: {calculateScore(player.cards)}</p>
            <div className="player-cards">
              {player.cards.map((card, i) => (
                <div key={i} className="card">
                  {card}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
	</div>
  );
};

export default GameResults;
