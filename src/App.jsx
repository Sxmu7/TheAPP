import { useState } from 'react'
import HomeScreen       from './screens/HomeScreen'
import LobbyScreen      from './screens/LobbyScreen'
import GameSelectScreen from './screens/GameSelectScreen'
import InGameScreen     from './screens/InGameScreen'
import { useRoom }      from './hooks/useRoom'
import * as api         from './firebaseApi'
import { GAMES, genCode } from './constants'

function Loading({ label = 'Verbinde…' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', gap:12 }}>
      <div style={{ fontSize:36 }}>🍺</div>
      <p style={{ color:'var(--text-2)', fontSize:14, margin:0 }}>{label}</p>
    </div>
  )
}

function ErrorScreen({ message, onBack }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', padding:'2rem', textAlign:'center', gap:16 }}>
      <div style={{ fontSize:36 }}>⚠️</div>
      <p style={{ fontWeight:500, margin:0 }}>{message}</p>
      <button className="btn-ghost" onClick={onBack} style={{ maxWidth:240 }}>Zurück zur Startseite</button>
    </div>
  )
}

export default function App() {
  const [roomCode, setRoomCode] = useState('')
  const [joining,  setJoining]  = useState(false)
  const { room, loading, error } = useRoom(roomCode)

  const screen = roomCode
    ? (loading && !room ? 'loading' : (room?.status ?? 'lobby'))
    : 'home'

  const handleCreateRoom = async () => {
    const code = genCode()
    await api.createRoom(code)
    setRoomCode(code)
  }

  const handleJoinRoom = async (c) => {
    setJoining(true)
    const exists = await api.roomExists(c)
    setJoining(false)
    if (!exists) { alert('Raum nicht gefunden.'); return }
    setRoomCode(c)
  }

  const handleAddPlayer    = async (name) => {
    if (!room || room.players.length >= 8) return
    await api.addPlayer(roomCode, name, room.players.length)
  }
  const handleRemovePlayer = async (id)   => api.removePlayer(roomCode, id)
  const handleChangeDrinks = async (id, delta) => {
    const p = room?.players?.find(p => p.id === id)
    if (!p) return
    await api.changeDrinks(roomCode, id, p.drinks + delta)
  }
  const handleStart        = async ()     => api.setStatus(roomCode, 'game-select')
  const handleSelectGame   = async (g)    => {
    await api.clearGameState(roomCode)  // reset game state for new game
    await api.selectGame(roomCode, g.id)
  }
  const handleNextPlayer   = async ()     => api.nextPlayer(roomCode, room.playerIdx ?? 0, room.players.length)
  const handleBack         = async (s)    => api.setStatus(roomCode, s)
  const handleSaveGameState = async (gs)  => api.saveGameState(roomCode, gs)

  if (screen === 'home')    return <HomeScreen onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} joiningRoom={joining} />
  if (screen === 'loading') return <Loading />
  if (error || !room)       return <ErrorScreen message={error ?? 'Raum nicht gefunden.'} onBack={() => setRoomCode('')} />

  const players    = room.players ?? []
  const playerIdx  = room.playerIdx ?? 0
  const currentGame = GAMES.find(g => g.id === room.gameId) ?? null

  if (screen === 'lobby')       return <LobbyScreen code={roomCode} players={players} onAddPlayer={handleAddPlayer} onRemovePlayer={handleRemovePlayer} onStart={handleStart} onBack={() => setRoomCode('')} />
  if (screen === 'game-select') return <GameSelectScreen players={players} onSelectGame={handleSelectGame} onBack={() => handleBack('lobby')} />
  if (screen === 'in-game')     return (
    <InGameScreen
      game={currentGame}
      players={players}
      playerIdx={playerIdx}
      gameState={room.gameState}
      onNextPlayer={handleNextPlayer}
      onChangeDrinks={handleChangeDrinks}
      onSaveGameState={handleSaveGameState}
      onBack={() => handleBack('game-select')}
    />
  )
  return null
}
