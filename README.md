# Imposter Game

A real-time multiplayer imposter game built with React, Node.js, Express, and Socket.io.

## Features

- Real-time multiplayer gameplay
- Room-based system with 6-letter codes
- Two game modes:
  - **Different Word**: Imposters get a similar but different word
  - **No Word**: Imposters only get category and hint
- Turn-based chat system with 20-second timer
- Voting and elimination mechanics
- Win condition detection
- Host controls with restart capability

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Real-time**: Socket.io
- **Deployment**: Ready for Render or Railway

## Local Development

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm run install-all
```

### Running Locally

Start both server and client in development mode:

```bash
npm run dev
```

- Server runs on: `http://localhost:3000`
- Client runs on: `http://localhost:5173`

### Development Scripts

- `npm run dev` - Run both server and client
- `npm run server` - Run server only
- `npm run client` - Run client only
- `npm run build` - Build client for production

## Deployment

### Render Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Deploy!

### Railway Deployment

1. Create a new project on Railway
2. Connect your GitHub repository
3. Railway will auto-detect settings
4. Add these environment variables if needed:
   - `NODE_ENV=production`
5. Deploy!

### Environment Variables

No environment variables are required. The app uses:
- `PORT` (provided by hosting platform, defaults to 3000)
- `NODE_ENV` (automatically set to 'production' on deployment)

## How to Play

1. **Create/Join Room**
   - Host creates a room and shares the 6-letter code
   - Players join using the code

2. **Host Settings**
   - Select number of imposters
   - Choose category (or random)
   - Select game mode
   - Start game when ready (minimum 3 players)

3. **Reveal Phase**
   - Each player clicks to reveal their role and word
   - Players get the actual word
   - Imposters get either a similar word or just hints

4. **Chat Phase**
   - Players take turns giving clues (20 seconds each)
   - Try to identify imposters without being too obvious
   - After all players give clues, move to voting

5. **Voting Phase**
   - All alive players vote for who they think is the imposter
   - Player with most votes is eliminated
   - Their role is revealed

6. **Win Conditions**
   - Players win if all imposters are eliminated
   - Imposters win if they equal or outnumber players

7. **Restart**
   - Host can restart game with same players
   - New roles and words are assigned

## Game Modes

### Different Word Mode
- Regular players: Get the actual word (e.g., "Beach")
- Imposters: Get a similar word (e.g., "Desert")
- Imposters must blend in by giving clues that could work for both

### No Word Mode
- Regular players: Get the actual word
- Imposters: Only get category and hint (e.g., "Places - Natural outdoor location")
- More challenging for imposters

## Project Structure

```
imposter-game/
├── server/
│   ├── index.js          # Express + Socket.io server
│   └── words.js          # Word database
├── client/
│   ├── src/
│   │   ├── pages/        # Game screens
│   │   ├── components/   # Reusable components
│   │   ├── App.jsx       # Main app component
│   │   ├── socket.js     # Socket.io client
│   │   └── main.jsx      # Entry point
│   ├── index.html
│   └── vite.config.js
└── package.json
```

## Technical Details

- **No Database**: All game state stored in-memory
- **No Authentication**: Simple name-based joining
- **Server Authority**: All game logic validated server-side
- **Room Cleanup**: Rooms deleted when empty
- **No Reconnection**: Players disconnected can't rejoin mid-game
- **Small Scale**: Designed for friend groups (3-10 players recommended)

## License

MIT
