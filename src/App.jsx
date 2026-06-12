import { useState } from 'react'
import HomeScreen       from './screens/HomeScreen'
import LobbyScreen      from './screens/LobbyScreen'
import GameSelectScreen from './screens/GameSelectScreen'
import InGameScreen     from './screens/InGameScreen'
import { useRoom }      from './hooks/useRoom'
import * as api         from './firebaseApi'
import { GAMES, genCode } from './constants'

// ─────────────────────────────────────────────────────────────────────────────
// Lade-Screen
// ─────────────────────────────────────────────────────────────────────────────
function Loading({ label = 'Verbinde…' }) {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '100dvh',
        gap:            12,
      }}
    >
      <div style={{ fontSize: 36 }}>🍺</div>
      <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0 }}>{label}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Fehler-Screen
// ─────────────────────────────────────────────────────────────────────────────
function ErrorScreen({ message, onBack }) {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '100dvh',
        padding:        '2rem',
        textAlign:      'center',
        gap:            16,
      }}
    >
      <div style={{ fontSize: 36 }}>⚠️</div>
      <p style={{ fontWeight: 500, margin: 0 }}>{message}</p>
      <button className="btn-ghost" onClick={onBack} style={{ maxWidth: 240 }}>
        Zurück zur Startseite
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// App — Haupt-State-Machine
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [roomCode, setRoomCode]   = useState('')
  const [joining, setJoining]     = useState(false)

  const { room, loading, error } = useRoom(roomCode)

  // Der aktuelle Screen leitet sich aus dem Firebase-Status ab.
  // Nur "home" ist rein lokal (kein Raum-Code).
  const screen = roomCode
    ? loading && !room ? 'loading' : (room?.status ?? 'lobby')
    : 'home'

  // ── Raum erstellen ─────────────────────────────────────────────────────────
  const handleCreateRoom = async () => {
    const code = genCode()
    await api.createRoom(code)
    setRoomCode(code)
  }

  // ── Raum beitreten ─────────────────────────────────────────────────────────
  const handleJoinRoom = async (code) => {
    setJoining(true)
    const exists = await api.roomExists(code)
    setJoining(false)
    if (!exists) {
      alert('Raum nicht gefunden. Überprüfe den Code.')
      return
    }
    setRoomCode(code)
  }

  // ── Spieler ────────────────────────────────────────────────────────────────
  const handleAddPlayer = async (name) => {
    if (!room || room.players.length >= 8) return
    const colorIdx = room.players.length  // 0, 1, 2, … → eindeutige Farbe
    await api.addPlayer(roomCode, name, colorIdx)
  }

  const handleRemovePlayer = async (id) => {
    await api.removePlayer(roomCode, id)
  }

  const handleChangeDrinks = async (playerId, delta) => {
    const player = room?.players?.find((p) => p.id === playerId)
    if (!player) return
    await api.changeDrinks(roomCode, playerId, player.drinks + delta)
  }

  // ── Spielfluss ─────────────────────────────────────────────────────────────
  const handleStart = async () => {
    await api.setStatus(roomCode, 'game-select')
  }

  const handleSelectGame = async (g) => {
    await api.selectGame(roomCode, g.id)
  }

  const handleNextPlayer = async () => {
    await api.nextPlayer(roomCode, room.playerIdx ?? 0, room.players.length)
  }

  const handleBack = async (targetStatus) => {
    await api.setStatus(roomCode, targetStatus)
  }

  const handleLeave = () => setRoomCode('')

  // ── Render ─────────────────────────────────────────────────────────────────
  if (screen === 'home') {
    return (
      <HomeScreen
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        joiningRoom={joining}
      />
    )
  }

  if (screen === 'loading') return <Loading />

  if (error || !room) {
    return (
      <ErrorScreen
        message={error ?? 'Raum nicht gefunden.'}
        onBack={handleLeave}
      />
    )
  }

  const players    = room.players ?? []
  const playerIdx  = room.playerIdx ?? 0
  const currentGame = GAMES.find((g) => g.id === room.gameId) ?? null

  if (screen === 'lobby') {
    return (
      <LobbyScreen
        code={roomCode}
        players={players}
        onAddPlayer={handleAddPlayer}
        onRemovePlayer={handleRemovePlayer}
        onStart={handleStart}
        onBack={handleLeave}
      />
    )
  }

  if (screen === 'game-select') {
    return (
      <GameSelectScreen
        players={players}
        onSelectGame={handleSelectGame}
        onBack={() => handleBack('lobby')}
      />
    )
  }

  if (screen === 'in-game') {
    return (
      <InGameScreen
        game={currentGame}
        players={players}
        playerIdx={playerIdx}
        onNextPlayer={handleNextPlayer}
        onChangeDrinks={handleChangeDrinks}
        onBack={() => handleBack('game-select')}
      />
    )
  }

  return null
}
