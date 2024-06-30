import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import LoginPage from './components/LoginPage';
import WaitingLobby from './components/WaitingLobby';
import GameLobby from './components/GameLobby';
import GameResults from './components/GameResults';

require('dotenv').config()

const socket = io('https://cabo-game-backend.onrender.com');

function App() {
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [card1Pile, setCard1Pile] = useState([]);
  const [card2Pile, setCard2Pile] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const navigate = useNavigate();

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
      navigate('/game');
    });

    return () => {
      socket.off('gameUpdate');
      socket.off('gameStarted');
    };
  }, [navigate]);

  const handleLogin = (name, image) => {
    setUsername(name);
    setProfileImage(image);
    setIsLoggedIn(true);
    socket.emit('joinGame', { id: socket.id, name, profileImage: image });
    navigate('/lobby');
  };

  const handleStartGame = () => {
    socket.emit('startGame');
  };

  const handleNextTurn = () => {
    socket.emit('nextTurn');
  };

  return (
    <Routes>
      <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/lobby" element={<WaitingLobby players={players} onStartGame={handleStartGame} />} />
      <Route path="/game" element={
        <GameLobby
          players={players}
          card1Pile={card1Pile}
          card2Pile={card2Pile}
          currentTurn={currentTurn}
          onNextTurn={handleNextTurn}
        />}
      />
      <Route path="/results" element={<GameResults />} />
    </Routes>
  );
}

export default App;
