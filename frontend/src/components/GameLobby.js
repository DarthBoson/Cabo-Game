import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './GameLobby.css';

const socket = io('http://localhost:4000');

function GameLobby({ players, card1Pile, card2Pile, currentTurn, onNextTurn }) {
  const [showPopup, setShowPopup] = useState(false);
  const [topCard, setTopCard] = useState(null);
  const [allowCardSelection, setAllowCardSelection] = useState(false);
  const [allowCardSwap, setAllowCardSwap] = useState(false);
  const [allowCardReplacement, setAllowCardReplacement] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [showCardValuePopup, setShowCardValuePopup] = useState(false);
  const [selectedCardValue, setSelectedCardValue] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [showCaboPopup, setShowCaboPopup] = useState(false);
  const [caboCalled, setCaboCalled] = useState(false);
  const [extraTurnsLeft, setExtraTurnsLeft] = useState(0);
  const [swapFromPile2, setSwapFromPile2] = useState(false);
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    setTopCard(card1Pile[card1Pile.length - 1]);
  }, [card1Pile]);

  useEffect(() => {
    setCurrentPlayer(players[currentTurn]);
  }, [currentTurn, players]);

  useEffect(() => {
    socket.on('allowCardSelection', ({ topCard }) => {
      setTopCard(topCard);
      setAllowCardSelection(true);
    });
    
	socket.on('allowCardSelection2', () => {
      setAllowCardSelection(true);
    });
	
    socket.on('allowCardSwap', ({ topCard }) => {
      setTopCard(topCard);
      setAllowCardSwap(true);
    });
	
	socket.on('allowCardSwapFromPile2', ({ topCard }) => {
      setTopCard(topCard);
      setSwapFromPile2(true);
	});
	
	socket.on('disableInitViewButton', () => {
      setButtonDisabled(true);
	});
	
    socket.on('gameEnded', (players) => {
      navigate('/results', { state: { players } });
    });

    return () => {
      socket.off('allowCardSelection');
      socket.off('allowCardSwap');
      socket.off('allowCardSwapFromPile2');
      socket.off('gameEnded');
	  socket.off('allowCardSelection2');
    };
  }, [navigate]);

  const handleCardClick = () => {
    if (card1Pile.length > 0) {
      setTopCard(card1Pile[card1Pile.length - 1]);
      setShowPopup(true);
    }
  };

  const handleUsePower = () => {
    const cardValue = topCard.slice(0, -1);
    if (['7', '8', '9', '10'].includes(cardValue)) {
      socket.emit('usePower');
    } else if (['J', 'Q'].includes(cardValue)) {
      socket.emit('usePower');
    } else {
      socket.emit('usePower');
    }
    setShowPopup(false);
  };

  const handleReplaceCard = () => {
    setAllowCardReplacement(true);
    setShowPopup(false);
  };

  const handleCardSelection = (cardValue, cardIndex, playerIndex) => {
    if (allowCardSelection) {
      setSelectedCardValue(cardValue);
      setShowCardValuePopup(true);
      setAllowCardSelection(false);
      socket.emit('selectCard');
    } else if (allowCardSwap) {
      const selectedCard = { playerIndex, cardIndex };
      const newSelectedCards = [...selectedCards, selectedCard];
      setSelectedCards(newSelectedCards);

      if (newSelectedCards.length === 2) {
        socket.emit('swapCards', newSelectedCards[0], newSelectedCards[1]);
        setSelectedCards([]);
        setAllowCardSwap(false);
      }
    } else if (allowCardReplacement && playerIndex === currentTurn) {
      socket.emit('replaceCard', playerIndex, cardIndex);
      setAllowCardReplacement(false);
    } else if (swapFromPile2 && playerIndex === currentTurn) {
      socket.emit('replaceCardFromPile2', currentTurn, cardIndex);
      setSwapFromPile2(false);
    }
  };

  const closeCardValuePopup = () => {
    setShowCardValuePopup(false);
  };

  const handleSwapFromPile2 = () => {
    if (card2Pile.length > 0) {
      socket.emit('useCardFromPile2');
	}
  };

  const swapCardFromPile2 = (playerIndex, cardIndex) => {
    if (playerIndex !== null && card2Pile.length > 0) {
      socket.emit('swapCardFromPile2', playerIndex, cardIndex);
    }
  };
  
  const handleInitialCardView = () => {
    socket.emit('viewInitialCard');
  };
  
  const callCabo = () => {
    socket.emit('callCabo');
    setShowCaboPopup(true);
    setCaboCalled(true);
    setExtraTurnsLeft(players.length - 1);
    setTimeout(() => {
      setShowCaboPopup(false);
    }, 5000);
  };

  const handleNextTurn = () => {
    if (caboCalled) {
      if (extraTurnsLeft > 0) {
        setExtraTurnsLeft(extraTurnsLeft - 1);
        onNextTurn();
      } else {
        socket.emit('endGame');
      }
    } else {
      onNextTurn();
    }
  };

  const renderPlayerSection = (player, index, position) => {
    const isCurrentTurn = currentTurn === index;

    return (
      <div key={index} className={`player-section ${position}`}>
        {position === 'bottom' && (
          <div className="player-hand">
            {player.cards.map((card, cardIndex) => (
              <div
                key={cardIndex}
                className={`card ${allowCardSelection || allowCardSwap || (allowCardReplacement && index === currentTurn) || (swapFromPile2 && index === currentTurn) ? 'selectable' : ''}`}
                onClick={() => (allowCardSelection || allowCardSwap || (allowCardReplacement && index === currentTurn) || (swapFromPile2 && index === currentTurn)) && handleCardSelection(card, cardIndex, index)}
                style={{ cursor: allowCardSelection || allowCardSwap || (allowCardReplacement && index === currentTurn) || (swapFromPile2 && index === currentTurn) ? 'pointer' : 'default' }}
              >
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
            {player.cards.map((card, cardIndex) => (
              <div
                key={cardIndex}
                className={`card ${allowCardSelection || allowCardSwap || (allowCardReplacement && index === currentTurn) || (swapFromPile2 && index === currentTurn) ? 'selectable' : ''}`}
                onClick={() => (allowCardSelection || allowCardSwap || (allowCardReplacement && index === currentTurn) || (swapFromPile2 && index === currentTurn)) && handleCardSelection(card, cardIndex, index)}
                style={{ cursor: allowCardSelection || allowCardSwap || (allowCardReplacement && index === currentTurn) || (swapFromPile2 && index === currentTurn) ? 'pointer' : 'default' }}
              >
                
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="game-lobby">
      
      <div className="game-content">
        <div className="sidebar">
          <div className="sidebar-cards">
            <div className="sidebar-card" onClick={handleCardClick}>
              Remaining: {card1Pile.length} cards
            </div>
            <div className="sidebar-card" onClick={handleSwapFromPile2}>
              {card2Pile.length > 0 ? `Card 2: ${card2Pile[card2Pile.length - 1]}` : 'Card 2'}
            </div>
          </div>
          <div className="sidebar-buttons">
            <button onClick={handleInitialCardView} disabled={isButtonDisabled}>View Card</button>
			<button onClick={callCabo}>Call Cabo</button>
            <button onClick={handleNextTurn}>End Turn</button>
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
      {showCardValuePopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Selected Card Value: {selectedCardValue}</h3>
            <button onClick={closeCardValuePopup}>Close</button>
          </div>
        </div>
      )}
      {showCaboPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>The current player has called Cabo!</h3>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameLobby;
