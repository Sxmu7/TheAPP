// Alle Datenbank-Operationen an einem Ort.
// Datenstruktur in Firebase:
//
// rooms/
//   {RAUMCODE}/
//     status:    "lobby" | "game-select" | "in-game"
//     gameId:    null | "g1" | "g2" | …
//     playerIdx: 0
//     createdAt: <timestamp>
//     players/
//       {pushId}/
//         name:     "Alice"
//         colorIdx: 0
//         drinks:   0

import {
  ref,
  set,
  get,
  push,
  update,
  remove,
  serverTimestamp,
} from 'firebase/database'
import { db } from './firebase'

// ── Raum ────────────────────────────────────────────────────────────────────

export async function createRoom(roomCode) {
  await set(ref(db, `rooms/${roomCode}`), {
    status:    'lobby',
    gameId:    null,
    playerIdx: 0,
    createdAt: serverTimestamp(),
    players:   {},
  })
}

export async function roomExists(roomCode) {
  const snap = await get(ref(db, `rooms/${roomCode}`))
  return snap.exists()
}

// ── Spieler ─────────────────────────────────────────────────────────────────

export async function addPlayer(roomCode, name, colorIdx) {
  const playerRef = push(ref(db, `rooms/${roomCode}/players`))
  await set(playerRef, { name, colorIdx, drinks: 0 })
  return playerRef.key
}

export async function removePlayer(roomCode, playerId) {
  await remove(ref(db, `rooms/${roomCode}/players/${playerId}`))
}

export async function changeDrinks(roomCode, playerId, newValue) {
  await update(ref(db, `rooms/${roomCode}/players/${playerId}`), {
    drinks: Math.max(0, newValue),
  })
}

// ── Spielfluss ───────────────────────────────────────────────────────────────

export async function setStatus(roomCode, status) {
  await update(ref(db, `rooms/${roomCode}`), { status })
}

export async function selectGame(roomCode, gameId) {
  await update(ref(db, `rooms/${roomCode}`), {
    gameId,
    status:    'in-game',
    playerIdx: 0,
  })
}

export async function nextPlayer(roomCode, currentIdx, total) {
  await update(ref(db, `rooms/${roomCode}`), {
    playerIdx: (currentIdx + 1) % total,
  })
}

// ── Game State (stored as JSON string to avoid Firebase array mangling) ───────

export async function saveGameState(roomCode, gameState) {
  await update(ref(db, `rooms/${roomCode}`), {
    gsj: JSON.stringify(gameState),
  })
}

export async function clearGameState(roomCode) {
  await update(ref(db, `rooms/${roomCode}`), { gsj: null })
}
