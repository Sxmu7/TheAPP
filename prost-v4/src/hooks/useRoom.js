import { useEffect, useState } from 'react'
import { ref, onValue, off }   from 'firebase/database'
import { db }                   from '../firebase'
import { PLAYER_COLORS }        from '../constants'

export function useRoom(roomCode) {
  const [room, setRoom]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!roomCode) { setRoom(null); setLoading(false); setError(null); return }

    setLoading(true)
    setError(null)

    const roomRef = ref(db, `rooms/${roomCode}`)

    const unsub = onValue(roomRef, (snap) => {
      const data = snap.val()
      if (!data) { setRoom(null); setError('Raum nicht gefunden.'); setLoading(false); return }

      const players = data.players
        ? Object.entries(data.players)
            .map(([id, p]) => ({
              id,
              name:     p.name,
              colorIdx: p.colorIdx,
              drinks:   p.drinks ?? 0,
              color:    PLAYER_COLORS[p.colorIdx % PLAYER_COLORS.length],
            }))
            .sort((a, b) => a.colorIdx - b.colorIdx)
        : []

      // Parse game state JSON (avoids Firebase array-to-object conversion)
      const gameState = data.gsj ? JSON.parse(data.gsj) : null

      setRoom({ ...data, players, gameState })
      setLoading(false)
    }, (err) => { setError(err.message); setLoading(false) })

    return () => off(roomRef)
  }, [roomCode])

  return { room, loading, error }
}
