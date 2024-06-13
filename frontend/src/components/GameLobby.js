import React, { useState, useEffect } from 'react';
import './GameLobby.css';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

function GameLobby({ players, card1Pile, card2Pile, currentTurn, onNextTurn }) {
  const [showPopup, setShowPopup] = useState(false);
  const [topCard, setTopCard] = useState(null);

  useEffect(() => {
    setTopCard(card1Pile[card1Pile.length - 1]);
  }, [card1Pile]);

  const handleCardClick = () => {
    if (card1Pile.length > 0) {
      setTopCard(card1Pile[card1Pile.length - 1]);
      setShowPopup(true);
    }
  };

  const handleUsePower = () => {
    socket.emit('usePower');
    setShowPopup(false);
  };

  const handleReplaceCard = () => {
    setShowPopup(false);
  };

  const renderPlayerSection = (player, index, position) => {
    const cardIndexStart = index * 4;
    const playerCards = card1Pile.slice(cardIndexStart, cardIndexStart + 4);
    const isCurrentTurn = currentTurn === index;

    return (
      <div key={index} className={`player-section ${position}`}>
        {position === 'bottom' && (
          <div className="player-hand">
            {playerCards.map((card) => (
              <div key={card} className="card">
                {card}
              </div>
            ))}
          </div>
        )}
        <div className={`player-card ${isCurrentTurn ? 'current-turn' : ''}`}>
          <img src={player.profileImage} alt={`${player.name}'s profile`} />
          <h3>{player.name}</h3>
        </div>
        {position === 'top' && (
          <div className="player-hand">
            {playerCards.map((card) => (
              <div key={card} className="card">
                {card}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="game-lobby">
      <h2>Game Lobby</h2>
      <div className="game-content">
        <div className="sidebar">
          <div className="sidebar-cards">
            <div className="sidebar-card" onClick={handleCardClick}>
              Remaining: {card1Pile.length} cards
            </div>
            <div className="sidebar-card">
              {card2Pile.length > 0 ? `Card 2: ${card2Pile[card2Pile.length - 1]}` : 'Card 2'}
            </div>
          </div>
          <div className="sidebar-buttons">
            <button>Button 1</button>
            <button>Button 2</button>
            <button>Button 3</button>
            <button onClick={onNextTurn}>Button 4</button>
          </div>
        </div>
        <div className="game-board">
          <div className="row top-row">
            {players.slice(0, 4).map((player, index) => renderPlayerSection(player, index, 'top'))}
          </div>
          <div className="row bottom-row">
            {players.slice(4, 8).map((player, index) => renderPlayerSection(player, index + 4, 'bottom'))}
          </div>
        </div>
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Top Card: {topCard}</h3>
            <button onClick={handleUsePower}>Use Power</button>
            <button onClick={handleReplaceCard}>Replace Card</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameLobby;
