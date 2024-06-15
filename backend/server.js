const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Import the cors package

const PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Allow only this origin to access the server
    methods: ["GET", "POST"]
  }
});

let players = []; // Initialize players array
let card1Pile = []; // Initialize card1Pile
let card2Pile = []; // Initialize card2Pile
let currentTurn = 0; // Initialize current turn
let topCard = null; // Initialize topCard

// Helper function to shuffle an array
function shuffleDeck(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Helper function to generate the initial deck of cards (2 decks with 2 jokers each)
function generateDeck() {
  const suits = ['H', 'D', 'C', 'S']; // Hearts, Diamonds, Clubs, Spades
  const cardValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  let deck = [];

  // Generate standard cards
  for (const suit of suits) {
    for (const value of cardValues) {
      deck.push(`${value}${suit}`);
    }
  }

  // Add Jokers
  deck.push('Jok', 'Jok');

  return deck;
}

// Generate initial cards and piles
function startNewGame() {
  let doubleDeck = [...generateDeck(), ...generateDeck()];
  card1Pile = shuffleDeck(doubleDeck);
  card2Pile = [];
  currentTurn = 0; // Reset current turn

  // Deal 4 cards to each player
  players.forEach(player => {
    player.cards = [];
    for (let i = 0; i < 4; i++) {
      player.cards.push(card1Pile.pop());
    }
  });
}

// Enable CORS for all routes
app.use(cors({
  origin: "http://localhost:3000" // Allow only this origin to access the server
}));

// Handle socket connection
io.on('connection', (socket) => {
  console.log(`New player connected: ${socket.id}`);

  // Handle joinGame event
  socket.on('joinGame', (player) => {
    players.push(player); // Add player to players array
    io.emit('gameUpdate', { players, card1Pile, card2Pile, currentTurn }); // Send updated state to all clients
  });

  // Handle startGame event
  socket.on('startGame', () => {
    startNewGame();
    io.emit('gameStarted', { players, card1Pile, card2Pile, currentTurn });
  });

  // Handle usePower event to move cards between card1Pile and card2Pile
  socket.on('usePower', () => {
    if (card1Pile.length > 0) {
      topCard = card1Pile.pop(); // Remove top card from card1Pile
      const cardValue = topCard.slice(0, -1);
      if (['7', '8', '9', '10'].includes(cardValue)) {
        socket.emit('allowCardSelection', { topCard });
      } else if (['J', 'Q'].includes(cardValue)) {
        socket.emit('allowCardSwap', { topCard });
      } else {
        card2Pile.push(topCard); // Add it to card2Pile
        io.emit('gameUpdate', { players, card1Pile, card2Pile, currentTurn }); // Send updated state to all clients
      }
    }
  });

  // Handle replaceCard event
  socket.on('replaceCard', (playerIndex, cardIndex) => {
    if (topCard) {
      const player = players[playerIndex];
      const replacedCard = player.cards.splice(cardIndex, 1, topCard)[0];
      card2Pile.push(replacedCard); // Add replaced card to card2Pile
      topCard = null; // Reset topCard
      io.emit('gameUpdate', { players, card1Pile, card2Pile, currentTurn }); // Send updated state to all clients
    }
  });

  // Handle card selection event
  socket.on('selectCard', () => {
    if (topCard) {
      card2Pile.push(topCard); // Add top card from card1Pile to card2Pile
      topCard = null; // Reset topCard
      io.emit('gameUpdate', { players, card1Pile, card2Pile, currentTurn }); // Send updated state to all clients
    }
  });

  // Handle card swap event
  socket.on('swapCards', (firstCardIndex, secondCardIndex) => {
    const temp = players[firstCardIndex.playerIndex].cards[firstCardIndex.cardIndex];
    players[firstCardIndex.playerIndex].cards[firstCardIndex.cardIndex] = players[secondCardIndex.playerIndex].cards[secondCardIndex.cardIndex];
    players[secondCardIndex.playerIndex].cards[secondCardIndex.cardIndex] = temp;

    if (topCard) {
      card2Pile.push(topCard); // Add top card from card1Pile to card2Pile
      topCard = null; // Reset topCard
      io.emit('gameUpdate', { players, card1Pile, card2Pile, currentTurn }); // Send updated state to all clients
    }
  });

  // Handle nextTurn event
  socket.on('nextTurn', () => {
    currentTurn = (currentTurn + 1) % players.length;
    io.emit('gameUpdate', { players, card1Pile, card2Pile, currentTurn });
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    players = players.filter(player => player.id !== socket.id); // Remove disconnected player from players array
    io.emit('gameUpdate', { players, card1Pile, card2Pile, currentTurn }); // Send updated state to all clients
    console.log(`Player disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
