import { useState, useEffect }           from 'react'
import { get, ref }                      from 'firebase/database'
import { db }                            from './firebase'
import { usePlayerName }                 from './hooks/usePlayerName'
import { useRoom }                       from './hooks/useRoom'
import * as api                          from './firebaseApi'
import { GAMES, PLAYER_COLORS, genCode } from './constants'

import OnboardingScreen  from './screens/OnboardingScreen'
import LandingScreen     from './screens/LandingScreen'
import LobbyScreen       from './screens/LobbyScreen'
import WaitingRoomScreen from './screens/WaitingRoomScreen'
import GameSelectScreen  from './screens/GameSelectScreen'
import InGameScreen      from './screens/InGameScreen'

function Loading() {
  return (
    <div style={{ minHeight:'100dvh', background:'#0b1520', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
      <div style={{ fontSize:36 }}>🃏</div>
      <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, margin:0, fontFamily:'inherit' }}>Verbinde…</p>
    </div>
  )
}

function ErrorScreen({ msg, onBack }) {
  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:'2rem', textAlign:'center' }}>
      <div style={{ fontSize:36 }}>⚠️</div>
      <p style={{ fontWeight:500, margin:0 }}>{msg}</p>
      <button className="btn-ghost" onClick={onBack} style={{ maxWidth:240 }}>Zurück</button>
    </div>
  )
}

export default function App() {
  const { name, playerId, saveName, clearName, hasName } = usePlayerName()

  const [roomCode, setRoomCode] = useState(() => {
    const p = new URLSearchParams(window.location.search).get('join')
    return p ? p.toUpperCase() : ''
  })
  const [creating, setCreating] = useState(false)
  const [joining,  setJoining]  = useState(false)

  const { room, loading, error } = useRoom(roomCode)

  // Auto-join via URL ?join=CODE
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('join')
    if (code && hasName && !roomCode) doJoin(code.toUpperCase())
  }, [hasName])

  // Auto-resolve vote when all players voted
  useEffect(() => {
    if (!room?.vote?.active) return
    const total = room.players?.length || 0
    const yes   = room.vote.yes?.length || 0
    const no    = room.vote.no?.length  || 0
    if (total > 0 && yes + no >= total) {
      api.resolveVote(roomCode, yes > total / 2 ? 'yes' : 'no')
    }
  }, [room?.vote])

  // ── Core join logic ────────────────────────────────────────────────────────

  const doJoin = async (code) => {
    // One single read — get entire room
    const snap = await get(ref(db, `rooms/${code}`))
    if (!snap.exists()) { alert('Raum nicht gefunden.'); return }

    const data    = snap.val()
    const players = data.players || {}

    // Only write if not already in room
    if (!players[playerId]) {
      const count    = Object.keys(players).length
      const colorIdx = count % PLAYER_COLORS.length
      await api.addPlayerWithId(code, playerId, name, colorIdx)
    }

    window.history.replaceState({}, '', '/')
    setRoomCode(code)
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreateRoom = async () => {
    if (!hasName) return
    setCreating(true)
    const code = genCode()
    await api.createRoom(code, playerId)
    await api.addPlayerWithId(code, playerId, name, 0)
    setRoomCode(code)
    setCreating(false)
  }

  const handleJoinRoom = async (code) => {
    if (!hasName) return
    setJoining(true)
    await doJoin(code)
    setJoining(false)
  }

  const handleLeave          = ()       => setRoomCode('')
  const handleRegenerateCode = async () => {
    const newCode = await api.regenerateCode(roomCode, playerId)
    setRoomCode(newCode)
  }
  const handleAddPlayer      = async (n) => {
    if (!room || room.players.length >= 8) return
    await api.addPlayer(roomCode, n, room.players.length)
  }
  const handleRemovePlayer   = async (id) => api.removePlayer(roomCode, id)
  const handleChangeDrinks   = async (id, delta) => {
    const p = room?.players?.find(x => x.id === id)
    if (!p) return
    await api.changeDrinks(roomCode, id, p.drinks + delta)
  }
  const handleStart          = async ()   => api.setStatus(roomCode, 'game-select')
  const handleSelectGame     = async (g)  => { await api.clearGameState(roomCode); await api.selectGame(roomCode, g.id) }
  const handleNextPlayer     = async ()   => api.nextPlayer(roomCode, room.playerIdx ?? 0, room.players.length)
  const handleBack           = async (s)  => api.setStatus(roomCode, s)
  const handleSaveGS         = async (gs) => api.saveGameState(roomCode, gs)
  const handleStartVote      = async ()   => api.startVote(roomCode, playerId)
  const handleCastVote       = async (choice) => {
    if (!room?.vote) return
    await api.castVote(roomCode, playerId, choice, room.vote.yes, room.vote.no)
  }

  // ── Routing ────────────────────────────────────────────────────────────────

  if (!hasName) return <OnboardingScreen onSave={saveName} />

  if (!roomCode) return (
    <LandingScreen
      playerName={name}
      onChangeName={clearName}
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
      creating={creating}
      joining={joining}
    />
  )

  if (loading && !room) return <Loading />
  if (error || !room)   return <ErrorScreen msg={error ?? 'Raum nicht gefunden.'} onBack={handleLeave} />

  const players     = room.players ?? []
  const playerIdx   = room.playerIdx ?? 0
  const currentGame = GAMES.find(g => g.id === room.gameId) ?? null
  const isHost      = room.hostId === playerId
  const imInGame    = players.find(p => p.id === playerId)
  const screen      = room?.status ?? 'lobby'

  if (screen === 'in-game' && !imInGame) {
    return <WaitingRoomScreen playerName={name} roomCode={roomCode} players={players} currentGame={currentGame} />
  }

  if (screen === 'lobby') return (
    <LobbyScreen
      code={roomCode} players={players} isHost={isHost}
      onAddPlayer={handleAddPlayer} onRemovePlayer={handleRemovePlayer}
      onStart={handleStart} onBack={handleLeave}
      onRegenerateCode={handleRegenerateCode}
      waitingRoom={room.waitingRoom}
    />
  )

  if (screen === 'game-select') return (
    <GameSelectScreen players={players} onSelectGame={handleSelectGame} onBack={() => handleBack('lobby')} />
  )

  if (screen === 'in-game') return (
    <InGameScreen
      game={currentGame} players={players} playerIdx={playerIdx}
      gameState={room.gameState} vote={room.vote}
      isHost={isHost} myPlayerId={playerId}
      isLastRound={room.lastRound}
      onNextPlayer={handleNextPlayer} onChangeDrinks={handleChangeDrinks}
      onSaveGameState={handleSaveGS} onBack={() => handleBack('game-select')}
      onStartVote={handleStartVote} onCastVote={handleCastVote}
    />
  )

  return null
}
