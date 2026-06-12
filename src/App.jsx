import { useState } from 'react'
import HomeScreen     from './screens/HomeScreen'
import LobbyScreen    from './screens/LobbyScreen'
import GameSelectScreen from './screens/GameSelectScreen'
import InGameScreen   from './screens/InGameScreen'
import { PLAYER_COLORS, genCode } from './constants'

export default function App() {
  const [screen, setScreen]     = useState('home')
  const [code, setCode]         = useState('')
  const [players, setPlayers]   = useState([])
  const [game, setGame]         = useState(null)
  const [playerIdx, setPlayerIdx] = useState(0)

  // ── Room ──────────────────────────────────────────────────────────────────
  const handleCreateRoom = () => {
    setCode(genCode())
    setPlayers([])
    setScreen('lobby')
  }

  const handleJoinRoom = (c) => {
    setCode(c.toUpperCase())
    setPlayers([])
    setScreen('lobby')
  }

  // ── Players ───────────────────────────────────────────────────────────────
  const handleAddPlayer = (name) => {
    setPlayers((prev) => [
      ...prev,
      {
        id:     Date.now(),
        name,
        color:  PLAYER_COLORS[prev.length % PLAYER_COLORS.length],
        drinks: 0,
      },
    ])
  }

  const handleRemovePlayer = (id) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id))
  }

  const handleChangeDrinks = (id, delta) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, drinks: Math.max(0, p.drinks + delta) } : p,
      ),
    )
  }

  // ── Game flow ─────────────────────────────────────────────────────────────
  const handleStart = () => {
    setPlayerIdx(0)
    setScreen('game-select')
  }

  const handleSelectGame = (g) => {
    setGame(g)
    setScreen('in-game')
  }

  const handleNextPlayer = () => {
    setPlayerIdx((prev) => (prev + 1) % players.length)
  }

  // ── Router ────────────────────────────────────────────────────────────────
  if (screen === 'home') {
    return (
      <HomeScreen
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    )
  }

  if (screen === 'lobby') {
    return (
      <LobbyScreen
        code={code}
        players={players}
        onAddPlayer={handleAddPlayer}
        onRemovePlayer={handleRemovePlayer}
        onStart={handleStart}
        onBack={() => setScreen('home')}
      />
    )
  }

  if (screen === 'game-select') {
    return (
      <GameSelectScreen
        players={players}
        onSelectGame={handleSelectGame}
        onBack={() => setScreen('lobby')}
      />
    )
  }

  if (screen === 'in-game') {
    return (
      <InGameScreen
        game={game}
        players={players}
        playerIdx={playerIdx}
        onNextPlayer={handleNextPlayer}
        onChangeDrinks={handleChangeDrinks}
        onBack={() => setScreen('game-select')}
      />
    )
  }

  return null
}
