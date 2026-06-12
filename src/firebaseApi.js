import {
  ref, set, get, push, update, remove, serverTimestamp,
} from 'firebase/database'
import { db } from './firebase'

// ── Room ─────────────────────────────────────────────────────────────────────

export async function createRoom(roomCode, hostId) {
  await set(ref(db, `rooms/${roomCode}`), {
    status: 'lobby', hostId,
    gameId: null, playerIdx: 0, gsj: null,
    vote: null, lastRound: false,
    createdAt: serverTimestamp(), players: {},
  })
}

export async function roomExists(roomCode) {
  return (await get(ref(db, `rooms/${roomCode}`))).exists()
}

export async function deleteRoom(roomCode) {
  await remove(ref(db, `rooms/${roomCode}`))
}

// ── Players ───────────────────────────────────────────────────────────────────

export async function addPlayerWithId(roomCode, playerId, name, colorIdx) {
  await set(ref(db, `rooms/${roomCode}/players/${playerId}`), { name, colorIdx, drinks: 0 })
}

export async function addPlayer(roomCode, name, colorIdx) {
  const r = push(ref(db, `rooms/${roomCode}/players`))
  await set(r, { name, colorIdx, drinks: 0 })
  return r.key
}

export async function removePlayer(roomCode, playerId) {
  await remove(ref(db, `rooms/${roomCode}/players/${playerId}`))
}

export async function changeDrinks(roomCode, playerId, val) {
  await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { drinks: Math.max(0, val) })
}

// ── Waiting room ──────────────────────────────────────────────────────────────

export async function joinWaitingRoom(roomCode, playerId, name) {
  await set(ref(db, `rooms/${roomCode}/waitingRoom/${playerId}`), { name, joinedAt: serverTimestamp() })
}

export async function promoteWaitingPlayers(roomCode, waitingRoom, currentPlayerCount) {
  const { PLAYER_COLORS } = await import('./constants.js')
  let idx = currentPlayerCount
  for (const [pid, data] of Object.entries(waitingRoom || {})) {
    await set(ref(db, `rooms/${roomCode}/players/${pid}`), {
      name: data.name,
      colorIdx: idx % PLAYER_COLORS.length,
      drinks: 0,
    })
    idx++
  }
  await remove(ref(db, `rooms/${roomCode}/waitingRoom`))
}

// ── Game flow ─────────────────────────────────────────────────────────────────

export async function setStatus(roomCode, status) {
  await update(ref(db, `rooms/${roomCode}`), { status })
}

export async function selectGame(roomCode, gameId) {
  await update(ref(db, `rooms/${roomCode}`), { gameId, status: 'in-game', playerIdx: 0, gsj: null })
}

export async function nextPlayer(roomCode, cur, total) {
  await update(ref(db, `rooms/${roomCode}`), { playerIdx: (cur + 1) % total })
}

export async function saveGameState(roomCode, gameState) {
  await update(ref(db, `rooms/${roomCode}`), { gsj: JSON.stringify(gameState) })
}

export async function clearGameState(roomCode) {
  await update(ref(db, `rooms/${roomCode}`), { gsj: null })
}

// ── Room code regeneration ────────────────────────────────────────────────────

export async function regenerateCode(oldCode, hostId, players) {
  const { genCode } = await import('./constants.js')
  const newCode = genCode()
  const snap    = await get(ref(db, `rooms/${oldCode}`))
  const data    = snap.val()
  await set(ref(db, `rooms/${newCode}`), { ...data, createdAt: serverTimestamp() })
  await remove(ref(db, `rooms/${oldCode}`))
  return newCode
}

// ── Vote (last round) ─────────────────────────────────────────────────────────

export async function startVote(roomCode, initiatedBy) {
  await update(ref(db, `rooms/${roomCode}`), {
    vote: { active: true, initiatedBy, yes: [], no: [] },
  })
}

export async function castVote(roomCode, playerId, choice, currentYes, currentNo) {
  const yes = choice==='yes' ? [...(currentYes||[]), playerId] : (currentYes||[])
  const no  = choice==='no'  ? [...(currentNo||[]),  playerId] : (currentNo||[])
  await update(ref(db, `rooms/${roomCode}/vote`), { yes, no })
}

export async function resolveVote(roomCode, result) {
  await update(ref(db, `rooms/${roomCode}`), {
    vote:      { active: false, result },
    lastRound: result === 'yes',
  })
}
