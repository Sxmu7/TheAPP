import { useState } from 'react'

const NAME_KEY = 'thecards_name'
const ID_KEY   = 'thecards_pid'

function getOrCreateId() {
  let id = localStorage.getItem(ID_KEY)
  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).slice(2)
    localStorage.setItem(ID_KEY, id)
  }
  return id
}

export function usePlayerName() {
  const [name, setNameState] = useState(() => localStorage.getItem(NAME_KEY) || '')
  const playerId = getOrCreateId()

  const saveName = (n) => {
    const trimmed = n.trim().slice(0, 16)
    localStorage.setItem(NAME_KEY, trimmed)
    setNameState(trimmed)
  }

  const clearName = () => {
    localStorage.removeItem(NAME_KEY)
    setNameState('')
  }

  return { name, playerId, saveName, clearName, hasName: name.length > 0 }
}
