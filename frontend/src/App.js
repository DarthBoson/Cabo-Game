import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import LoginPage from './components/LoginPage';
import WaitingLobby from './components/WaitingLobby';
import GameLobby from './components/GameLobby';

const socket = io('http://localhost:4000');

function App() {
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [card1Pile, setCard1Pile] = useState([]);
  const [card2Pile, setCard2Pile] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);

  useEffect(() => {
    socket.on('gameUpdate', ({ players, card1Pile, card2Pile, currentTurn }) => {
      setPlayers(players);
      setCard1Pile(card1Pile);
      setCard2Pile(card2Pile);
      setCurrentTurn(currentTurn);
    });

    socket.on('gameStarted', ({ players, card1Pile, card2Pile, currentTurn }) => {
      setPlayers(players);
      setCard1Pile(card1Pile);
      setCard2Pile(card2Pile);
      setCurrentTurn(currentTurn);
      setIsGameStarted(true);
    });

    return () => {
      socket.off('gameUpdate');
      socket.off('gameStarted');
    };
  }, []);

  const handleLogin = (name, image) => {
    setUsername(name);
    setProfileImage(image);
    setIsLoggedIn(true);
    socket.emit('joinGame', { id: socket.id, name, profileImage: image });
  };

  const handleStartGame = () => {
    socket.emit('startGame');
  };

  const handleNextTurn = () => {
    socket.emit('nextTurn');
  };

  return (
    <div className="App">
      {!isLoggedIn && <LoginPage onLogin={handleLogin} />}
      {isLoggedIn && !isGameStarted && <WaitingLobby players={players} onStartGame={handleStartGame} />}
      {isLoggedIn && isGameStarted && (
        <GameLobby
          players={players}
          card1Pile={card1Pile}
          card2Pile={card2Pile}
          currentTurn={currentTurn}
          onNextTurn={handleNextTurn}
        />
      )}
    </div>
  );
}

export default App;
