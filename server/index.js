import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { words, categories } from './words.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// In-memory storage
const rooms = {};
const playerRooms = {}; // Track which room each socket is in

// Utility functions
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms[code] ? generateRoomCode() : code;
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getRandomWord(category) {
  const categoryWords = words[category];
  return categoryWords[Math.floor(Math.random() * categoryWords.length)];
}

function emitRoomUpdate(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  // Send public room data to all players
  io.to(roomCode).emit('room_update', {
    roomCode,
    hostId: room.hostId,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      alive: p.alive,
      hasRevealed: p.hasRevealed
    })),
    phase: room.phase,
    category: room.category,
    mode: room.mode,
    impostersCount: room.impostersCount,
    turnIndex: room.turnIndex,
    round: room.round,
    clues: room.clues || [], // Send all clues including previous rounds
    tiedPlayers: room.tiedPlayers || [],
    isRevote: room.isRevote || false
  });
}

function assignRoles(roomCode) {
  const room = rooms[roomCode];
  
  // Get random word
  const selectedCategory = room.category === 'random' 
    ? categories[Math.floor(Math.random() * categories.length)]
    : room.category;
  
  const wordData = getRandomWord(selectedCategory);
  room.actualWord = wordData.word;
  room.imposterWord = wordData.similar;
  room.hint = wordData.hint;
  room.actualCategory = selectedCategory;

  // Shuffle and select imposters
  const shuffled = shuffleArray(room.players);
  const imposterIds = shuffled.slice(0, room.impostersCount).map(p => p.id);

  // Assign roles and words
  room.players.forEach(player => {
    const isImposter = imposterIds.includes(player.id);
    player.role = isImposter ? 'imposter' : 'player';
    
    if (room.mode === 'different_word') {
      player.word = isImposter ? room.imposterWord : room.actualWord;
    } else if (room.mode === 'no_word') {
      player.word = isImposter ? null : room.actualWord;
    }

    // Send private role data
    io.to(player.id).emit('role_assigned', {
      role: player.role,
      word: player.word,
      category: isImposter ? room.actualCategory : null,
      hint: isImposter ? room.hint : null,
      mode: room.mode
    });
  });
}

function startTurnTimer(roomCode) {
  const room = rooms[roomCode];
  if (!room || room.phase !== 'chat') return;

  if (room.turnTimer) {
    clearTimeout(room.turnTimer);
  }

  room.turnTimer = setTimeout(() => {
    // Auto-advance turn on timeout
    if (room.phase === 'chat') {
      const currentPlayer = room.players[room.turnIndex];
      if (currentPlayer && currentPlayer.alive) {
        room.clues.push({
          playerId: currentPlayer.id,
          playerName: currentPlayer.name,
          clue: '[Timeout - No clue given]'
        });
        io.to(roomCode).emit('clue_added', {
          playerId: currentPlayer.id,
          playerName: currentPlayer.name,
          clue: '[Timeout - No clue given]'
        });
      }
      nextTurn(roomCode);
    }
  }, 40000);
}

function nextTurn(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  if (room.turnTimer) {
    clearTimeout(room.turnTimer);
    room.turnTimer = null;
  }

  const alivePlayers = room.players.filter(p => p.alive);
  
  // Find next alive player
  let attempts = 0;
  do {
    room.turnIndex = (room.turnIndex + 1) % room.players.length;
    attempts++;
  } while (!room.players[room.turnIndex].alive && attempts < room.players.length);

  // Check if round complete
  const allAliveHaveSpoken = alivePlayers.every(p => 
    room.clues.some(c => c.playerId === p.id && c.round === room.round)
  );

  if (allAliveHaveSpoken) {
    // Wait 10 seconds before moving to voting so everyone can see the last clue
    setTimeout(() => {
      if (!rooms[roomCode] || room.phase !== 'chat') return;
      
      room.phase = 'voting';
      room.votes = {};
      if (room.turnTimer) {
        clearTimeout(room.turnTimer);
        room.turnTimer = null;
      }
      io.to(roomCode).emit('phase_changed', { phase: 'voting' });
      emitRoomUpdate(roomCode);
    }, 10000);
  } else {
    // Continue chat phase
    io.to(roomCode).emit('turn_changed', {
      turnIndex: room.turnIndex,
      currentPlayer: room.players[room.turnIndex]
    });
    emitRoomUpdate(roomCode);
    startTurnTimer(roomCode);
  }
}

function checkWinCondition(roomCode) {
  const room = rooms[roomCode];
  const alivePlayers = room.players.filter(p => p.alive);
  const aliveImposters = alivePlayers.filter(p => p.role === 'imposter');
  const aliveNormal = alivePlayers.filter(p => p.role === 'player');

  if (aliveImposters.length === 0) {
    // Players win
    room.phase = 'game_over';
    io.to(roomCode).emit('game_over', {
      winner: 'players',
      actualWord: room.actualWord,
      imposterWord: room.imposterWord,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        word: p.role === 'imposter' && room.mode === 'different_word' ? room.imposterWord : (p.role === 'player' ? room.actualWord : null)
      }))
    });
    emitRoomUpdate(roomCode);
    return true;
  } else if (aliveImposters.length >= aliveNormal.length) {
    // Imposters win
    room.phase = 'game_over';
    io.to(roomCode).emit('game_over', {
      winner: 'imposters',
      actualWord: room.actualWord,
      imposterWord: room.imposterWord,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        word: p.role === 'imposter' && room.mode === 'different_word' ? room.imposterWord : (p.role === 'player' ? room.actualWord : null)
      }))
    });
    emitRoomUpdate(roomCode);
    return true;
  }

  return false;
}

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create_room', ({ playerName }) => {
    if (!playerName || playerName.trim() === '') {
      socket.emit('error_message', { message: 'Player name is required' });
      return;
    }

    const roomCode = generateRoomCode();
    
    rooms[roomCode] = {
      hostId: socket.id,
      players: [{
        id: socket.id,
        name: playerName.trim(),
        role: null,
        word: null,
        alive: true,
        hasRevealed: false
      }],
      impostersCount: 1,
      category: 'random',
      mode: 'different_word',
      phase: 'lobby',
      turnIndex: 0,
      votes: {},
      round: 1,
      clues: [],
      tiedPlayers: [],
      isRevote: false
    };

    playerRooms[socket.id] = roomCode;
    socket.join(roomCode);

    socket.emit('room_created', { roomCode });
    emitRoomUpdate(roomCode);
  });

  socket.on('join_room', ({ roomCode, playerName }) => {
    if (!roomCode || !playerName) {
      socket.emit('error_message', { message: 'Room code and player name are required' });
      return;
    }

    const room = rooms[roomCode.toUpperCase()];
    
    if (!room) {
      socket.emit('error_message', { message: 'Room not found' });
      return;
    }

    if (room.phase !== 'lobby') {
      socket.emit('error_message', { message: 'Game already started' });
      return;
    }

    if (room.players.some(p => p.name.toLowerCase() === playerName.trim().toLowerCase())) {
      socket.emit('error_message', { message: 'Name already taken in this room' });
      return;
    }

    room.players.push({
      id: socket.id,
      name: playerName.trim(),
      role: null,
      word: null,
      alive: true,
      hasRevealed: false
    });

    playerRooms[socket.id] = roomCode.toUpperCase();
    socket.join(roomCode.toUpperCase());

    socket.emit('room_joined', { roomCode: roomCode.toUpperCase() });
    emitRoomUpdate(roomCode.toUpperCase());
  });

  socket.on('update_settings', ({ impostersCount, category, mode }) => {
    const roomCode = playerRooms[socket.id];
    const room = rooms[roomCode];

    if (!room) {
      socket.emit('error_message', { message: 'Room not found' });
      return;
    }

    if (room.hostId !== socket.id) {
      socket.emit('error_message', { message: 'Only host can update settings' });
      return;
    }

    if (room.phase !== 'lobby') {
      socket.emit('error_message', { message: 'Cannot update settings after game started' });
      return;
    }

    if (impostersCount !== undefined) {
      if (impostersCount < 1 || impostersCount >= room.players.length) {
        socket.emit('error_message', { message: 'Invalid imposter count' });
        return;
      }
      room.impostersCount = impostersCount;
    }

    if (category !== undefined) {
      if (category !== 'random' && !categories.includes(category)) {
        socket.emit('error_message', { message: 'Invalid category' });
        return;
      }
      room.category = category;
    }

    if (mode !== undefined) {
      if (!['different_word', 'no_word'].includes(mode)) {
        socket.emit('error_message', { message: 'Invalid game mode' });
        return;
      }
      room.mode = mode;
    }

    emitRoomUpdate(roomCode);
  });

  socket.on('start_game', () => {
    const roomCode = playerRooms[socket.id];
    const room = rooms[roomCode];

    if (!room) {
      socket.emit('error_message', { message: 'Room not found' });
      return;
    }

    if (room.hostId !== socket.id) {
      socket.emit('error_message', { message: 'Only host can start game' });
      return;
    }

    if (room.phase !== 'lobby') {
      socket.emit('error_message', { message: 'Game already started' });
      return;
    }

    if (room.players.length < 3) {
      socket.emit('error_message', { message: 'Need at least 3 players to start' });
      return;
    }

    if (room.impostersCount >= room.players.length) {
      socket.emit('error_message', { message: 'Too many imposters' });
      return;
    }

    // Assign roles
    assignRoles(roomCode);
    
    // Set phase to reveal
    room.phase = 'reveal';
    io.to(roomCode).emit('phase_changed', { phase: 'reveal' });
    emitRoomUpdate(roomCode);
  });

  socket.on('reveal_word', () => {
    const roomCode = playerRooms[socket.id];
    const room = rooms[roomCode];

    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.hasRevealed = true;
      emitRoomUpdate(roomCode);

      // Check if all revealed
      if (room.players.every(p => p.hasRevealed)) {
        // Wait 5 seconds before starting chat phase
        setTimeout(() => {
          if (!rooms[roomCode] || room.phase !== 'reveal') return;
          
          room.phase = 'chat';
          room.turnIndex = 0;
          // Don't reset clues here - keep chat history across rounds
          if (!room.clues) {
            room.clues = [];
          }
          io.to(roomCode).emit('phase_changed', { phase: 'chat' });
          io.to(roomCode).emit('turn_changed', {
            turnIndex: 0,
            currentPlayer: room.players[0]
          });
          emitRoomUpdate(roomCode);
          startTurnTimer(roomCode);
        }, 5000);
      }
    }
  });

  socket.on('submit_clue', ({ clue }) => {
    const roomCode = playerRooms[socket.id];
    const room = rooms[roomCode];

    if (!room) {
      socket.emit('error_message', { message: 'Room not found' });
      return;
    }

    if (room.phase !== 'chat') {
      socket.emit('error_message', { message: 'Not in chat phase' });
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    
    if (!player || !player.alive) {
      socket.emit('error_message', { message: 'You are not alive' });
      return;
    }

    if (room.players[room.turnIndex].id !== socket.id) {
      socket.emit('error_message', { message: 'Not your turn' });
      return;
    }

    // Check if already submitted clue this round
    if (room.clues.some(c => c.playerId === socket.id && c.round === room.round)) {
      socket.emit('error_message', { message: 'Already submitted clue this round' });
      return;
    }

    // Add clue
    room.clues.push({
      playerId: socket.id,
      playerName: player.name,
      clue: clue.trim(),
      round: room.round
    });

    // Emit room update so everyone sees the new clue immediately
    emitRoomUpdate(roomCode);
    
    io.to(roomCode).emit('clue_added', {
      playerId: socket.id,
      playerName: player.name,
      clue: clue.trim()
    });

    // Move to next turn
    nextTurn(roomCode);
  });

  socket.on('cast_vote', ({ targetId }) => {
  const roomCode = playerRooms[socket.id];
  const room = rooms[roomCode];

  if (!room) {
    socket.emit('error_message', { message: 'Room not found' });
    return;
  }

  if (room.phase !== 'voting' && room.phase !== 'revote') {
    socket.emit('error_message', { message: 'Not in voting phase' });
    return;
  }

  const voter = room.players.find(p => p.id === socket.id);

  if (!voter || !voter.alive) {
    socket.emit('error_message', { message: 'You are not alive' });
    return;
  }

  // ✅ BLOCK TIED PLAYERS FROM VOTING DURING REVOTE
  if (room.phase === 'revote' && room.tiedPlayers.includes(socket.id)) {
    socket.emit('error_message', { message: 'Tied players cannot vote in revote' });
    return;
  }

  if (targetId === socket.id) {
    socket.emit('error_message', { message: 'Cannot vote for yourself' });
    return;
  }

  const target = room.players.find(p => p.id === targetId);

  if (!target || !target.alive) {
    socket.emit('error_message', { message: 'Invalid vote target' });
    return;
  }

  // ✅ During revote, can only vote for tied players
  if (room.phase === 'revote' && !room.tiedPlayers.includes(targetId)) {
    socket.emit('error_message', { message: 'Can only vote for tied players' });
    return;
  }

  if (room.votes[socket.id]) {
    socket.emit('error_message', { message: 'Already voted' });
    return;
  }

  // Cast vote
  room.votes[socket.id] = targetId;

  const alivePlayers = room.players.filter(p => p.alive);

  // ✅ Determine eligible voters
  const eligibleVoters = room.phase === 'revote'
    ? alivePlayers.filter(p => !room.tiedPlayers.includes(p.id))
    : alivePlayers;

  const votesSubmitted = Object.keys(room.votes).length;

  io.to(roomCode).emit('vote_cast', {
    voterId: socket.id,
    votesSubmitted,
    totalAlive: eligibleVoters.length
  });

  // ✅ Check if all eligible voters voted
  if (votesSubmitted === eligibleVoters.length) {

    // Count votes
    const voteCounts = {};
    Object.values(room.votes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    const maxVotes = Math.max(...Object.values(voteCounts));
    const tied = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes);

    // If already in revote OR clear winner → eliminate
    if (room.phase === 'revote' || tied.length === 1) {

      let eliminated;

      if (tied.length > 1) {
        // Still tied after revote → random elimination
        eliminated = room.players.find(
          p => p.id === tied[Math.floor(Math.random() * tied.length)]
        );
      } else {
        eliminated = room.players.find(p => p.id === tied[0]);
      }

      eliminated.alive = false;

      room.phase = 'result';

      io.to(roomCode).emit('player_eliminated', {
        playerId: eliminated.id,
        playerName: eliminated.name,
        role: eliminated.role,
        voteCounts,
        wasRevote: room.isRevote || false,
        wasTiebreaker: tied.length > 1
      });

      room.isRevote = false;
      room.tiedPlayers = [];
      emitRoomUpdate(roomCode);

      // Check win condition after delay
      setTimeout(() => {
        if (!checkWinCondition(roomCode)) {

          room.round++;
          room.votes = {};
          room.phase = 'chat';
          room.turnIndex = 0;

          // Find first alive player
          while (!room.players[room.turnIndex].alive) {
            room.turnIndex = (room.turnIndex + 1) % room.players.length;
          }

          io.to(roomCode).emit('phase_changed', { phase: 'chat' });
          io.to(roomCode).emit('turn_changed', {
            turnIndex: room.turnIndex,
            currentPlayer: room.players[room.turnIndex]
          });

          emitRoomUpdate(roomCode);
          startTurnTimer(roomCode);
        }
      }, 3000);

    } else {
      // First vote tie → start revote
      room.phase = 'revote';
      room.isRevote = true;
      room.tiedPlayers = tied;
      room.votes = {};

      io.to(roomCode).emit('revote_started', {
        tiedPlayers: tied.map(id => {
          const player = room.players.find(p => p.id === id);
          return { id: player.id, name: player.name };
        }),
        voteCounts
      });

      io.to(roomCode).emit('phase_changed', { phase: 'revote' });
      emitRoomUpdate(roomCode);
    }
  }
});

  socket.on('restart_game', () => {
    const roomCode = playerRooms[socket.id];
    const room = rooms[roomCode];

    if (!room) {
      socket.emit('error_message', { message: 'Room not found' });
      return;
    }

    if (room.hostId !== socket.id) {
      socket.emit('error_message', { message: 'Only host can restart game' });
      return;
    }

    if (room.phase !== 'game_over') {
      socket.emit('error_message', { message: 'Can only restart after game over' });
      return;
    }

    // Reset game state
    room.players.forEach(p => {
      p.alive = true;
      p.hasRevealed = false;
      p.role = null;
      p.word = null;
    });

    room.round = 1;
    room.votes = {};
    room.turnIndex = 0;
    room.clues = [];
    
    // Assign new roles
    assignRoles(roomCode);
    
    room.phase = 'reveal';
    io.to(roomCode).emit('phase_changed', { phase: 'reveal' });
    emitRoomUpdate(roomCode);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const roomCode = playerRooms[socket.id];
    if (roomCode && rooms[roomCode]) {
      const room = rooms[roomCode];
      
      // Remove player
      room.players = room.players.filter(p => p.id !== socket.id);
      
      // If host left, assign new host or delete room
      if (room.hostId === socket.id) {
        if (room.players.length > 0) {
          room.hostId = room.players[0].id;
        } else {
          delete rooms[roomCode];
          delete playerRooms[socket.id];
          return;
        }
      }

      delete playerRooms[socket.id];
      
      if (room.players.length === 0) {
        delete rooms[roomCode];
      } else {
        emitRoomUpdate(roomCode);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});