import { useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const SUITS = ['♠', '♥', '♦', '♣']
const RED   = new Set(['♥', '♦'])
const VL    = { 11:'J', 12:'Q', 13:'K', 14:'A' }

const ROLE_LABEL = {
  president:        '👑 Präsident',
  vize:             '🥈 Vize-Präsident',
  buerger:          '👤 Bürger',
  'vize-arschloch': '🥴 Vize-Arschloch',
  arschloch:        '💩 Arschloch',
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure Game Logic
// ─────────────────────────────────────────────────────────────────────────────
function mkCard(suit, value) {
  return { id: `${suit}${value}`, suit, value, label: VL[value] || String(value) }
}

function createDeck() {
  return SUITS.flatMap(s => [2,3,4,5,6,7,8,9,10,11,12,13,14].map(v => mkCard(s, v)))
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function dealCards(playerIds) {
  const deck  = shuffle(createDeck())
  const hands = Object.fromEntries(playerIds.map(id => [id, []]))
  deck.forEach((c, i) => hands[playerIds[i % playerIds.length]].push(c))
  playerIds.forEach(id => hands[id].sort((a, b) => a.value - b.value))
  return hands
}

function canPlay(selected, topValue, pileCount, revolution) {
  if (!selected.length) return false
  if (!selected.every(c => c.value === selected[0].value)) return false
  if (pileCount > 0 && selected.length !== pileCount) return false
  if (topValue === null) return true
  return revolution ? selected[0].value < topValue : selected[0].value > topValue
}

function computeRoles(finishedIds, allIds) {
  const n = allIds.length
  const roles = {}
  finishedIds.forEach((id, i) => {
    if (i === 0)                         roles[id] = 'president'
    else if (i === 1 && n >= 4)          roles[id] = 'vize'
    else if (i === finishedIds.length - 1 && n >= 4 && finishedIds.length >= n - 1)
                                         roles[id] = 'vize-arschloch'
    else                                 roles[id] = 'buerger'
  })
  allIds.forEach(id => { if (!roles[id]) roles[id] = 'arschloch' })
  return roles
}

function nextActive(currentId, passedIds, activeIds) {
  const remaining = activeIds.filter(id => !passedIds.includes(id))
  if (!remaining.length) return currentId
  const idx = remaining.indexOf(currentId)
  return remaining[(idx + 1) % remaining.length]
}

function initRound(playerIds, prevRoles, roundNumber) {
  const hands = dealCards(playerIds)

  // Exchange: auto-move arschloch's 2 best → president; vize-arschloch's 1 best → vize
  let exchange = null
  if (roundNumber > 1 && prevRoles) {
    const presId    = playerIds.find(id => prevRoles[id] === 'president')
    const arsId     = playerIds.find(id => prevRoles[id] === 'arschloch')
    const vizeId    = playerIds.find(id => prevRoles[id] === 'vize')
    const vizeArsId = playerIds.find(id => prevRoles[id] === 'vize-arschloch')

    if (arsId && presId) {
      const give = [...hands[arsId]].sort((a, b) => b.value - a.value).slice(0, 2)
      give.forEach(c => {
        hands[arsId]   = hands[arsId].filter(x => x.id !== c.id)
        hands[presId]  = [...hands[presId], c].sort((a, b) => a.value - b.value)
      })
    }
    if (vizeArsId && vizeId) {
      const give = [...hands[vizeArsId]].sort((a, b) => b.value - a.value).slice(0, 1)
      give.forEach(c => {
        hands[vizeArsId] = hands[vizeArsId].filter(x => x.id !== c.id)
        hands[vizeId]    = [...hands[vizeId], c].sort((a, b) => a.value - b.value)
      })
    }

    const needPresSwap = !!(presId && arsId)
    const needVizeSwap = !!(vizeId && vizeArsId)
    exchange = {
      presId, arsId, vizeId, vizeArsId,
      step: needPresSwap ? 'president' : (needVizeSwap ? 'vize' : 'done'),
    }
  }

  // Who starts
  let startId = playerIds[0]
  if (roundNumber === 1 || !prevRoles) {
    let minVal = 999
    playerIds.forEach(id => {
      if (hands[id][0]?.value < minVal) { minVal = hands[id][0].value; startId = id }
    })
  } else {
    startId = playerIds.find(id => prevRoles[id] === 'arschloch') || playerIds[0]
  }

  return {
    phase:        exchange && exchange.step !== 'done' ? 'exchange' : 'tricks',
    roundNumber,
    hands,
    pile:         [],
    pileCount:    0,
    pileTopValue: null,
    lastPlayedBy: null,
    currentId:    startId,
    passedIds:    [],
    activeIds:    [...playerIds],
    finishedIds:  [],
    roles:        prevRoles || {},
    revolution:   false,
    exchange,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Card Component
// ─────────────────────────────────────────────────────────────────────────────
function Card({ card, selected, onClick, faceDown, small }) {
  if (faceDown) {
    return (
      <div style={{
        width: small ? 28 : 42, height: small ? 40 : 60,
        borderRadius: 5,
        background: 'linear-gradient(135deg, #1a3a8a 0%, #0d2266 100%)',
        border: '1.5px solid #4a6fd4',
        flexShrink: 0,
      }} />
    )
  }
  const red = RED.has(card.suit)
  return (
    <div
      onClick={onClick}
      style={{
        width: small ? 28 : 42, height: small ? 40 : 60,
        borderRadius: 5,
        background: selected ? '#EEEDFE' : '#ffffff',
        border: selected ? '2px solid #534AB7' : '1.5px solid #ddd',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        color: red ? '#E24B4A' : '#141414',
        transform: selected ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'transform 0.12s, border-color 0.12s, background 0.12s',
        userSelect: 'none',
        boxShadow: selected ? '0 4px 12px rgba(83,74,183,0.25)' : '0 1px 3px rgba(0,0,0,0.15)',
        flexShrink: 0,
        gap: 1,
      }}
    >
      <span style={{ fontSize: small ? 8 : 11, fontWeight: 600, lineHeight: 1 }}>{card.label}</span>
      <span style={{ fontSize: small ? 11 : 18, lineHeight: 1 }}>{card.suit}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exchange Phase
// ─────────────────────────────────────────────────────────────────────────────
function ExchangePhase({ gs, players, onUpdate }) {
  const [sel, setSel] = useState([])
  const ex = gs.exchange
  const actorId   = ex.step === 'president' ? ex.presId   : ex.vizeId
  const receiverId = ex.step === 'president' ? ex.arsId    : ex.vizeArsId
  const needed    = ex.step === 'president' ? 2 : 1
  const actor     = players.find(p => p.id === actorId)
  const hand      = gs.hands[actorId] || []

  const toggle = (card) => {
    setSel(prev =>
      prev.find(c => c.id === card.id)
        ? prev.filter(c => c.id !== card.id)
        : prev.length < needed ? [...prev, card] : prev
    )
  }

  const confirm = () => {
    if (sel.length !== needed) return
    const newHands = { ...gs.hands }
    sel.forEach(c => {
      newHands[actorId]    = newHands[actorId].filter(x => x.id !== c.id)
      newHands[receiverId] = [...newHands[receiverId], c].sort((a,b) => a.value - b.value)
    })

    const nextStep =
      ex.step === 'president' && ex.vizeId && ex.vizeArsId ? 'vize' : 'done'

    onUpdate({
      ...gs,
      hands:    newHands,
      exchange: { ...ex, step: nextStep },
      phase:    nextStep === 'done' ? 'tricks' : 'exchange',
    })
    setSel([])
  }

  return (
    <div style={{ padding: '1.5rem 1.25rem', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ background: '#EEEDFE', border: '1px solid #AFA9EC', borderRadius: 14, padding: '1.25rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', color: '#534AB7' }}>KARTENTAUSCH</p>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 500, color: '#3C3489' }}>
          {actor?.name}, wähle {needed} {needed === 1 ? 'Karte' : 'Karten'} zum Zurückgeben
        </p>
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#7F77DD' }}>
          ({needed === 2 ? 'Präsident gibt 2 Karten ans Arschloch zurück' : 'Vize-Präsident gibt 1 Karte zurück'})
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: '1.5rem', minHeight: 70 }}>
        {hand.map(card => (
          <Card key={card.id} card={card} selected={!!sel.find(c => c.id === card.id)} onClick={() => toggle(card)} />
        ))}
      </div>

      <button
        onClick={confirm}
        disabled={sel.length !== needed}
        style={{
          width: '100%', padding: '14px', borderRadius: 10,
          background: sel.length === needed ? '#534AB7' : '#f0f0f0',
          border: 'none',
          color: sel.length === needed ? '#fff' : '#999',
          fontSize: 15, fontWeight: 500, cursor: sel.length === needed ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
        }}
      >
        {sel.length} / {needed} ausgewählt — Bestätigen
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Round End Phase
// ─────────────────────────────────────────────────────────────────────────────
function RoundEnd({ gs, players, onNewRound }) {
  const roles   = computeRoles(gs.finishedIds, gs.activeIds.length ? gs.activeIds : players.map(p=>p.id))
  const arsId   = Object.entries(roles).find(([,r]) => r==='arschloch')?.[0]
  const arsPly  = players.find(p => p.id === arsId)
  const drinkCount = players.length

  const ordered = [...players].sort((a, b) => {
    const ri = Object.keys(ROLE_LABEL)
    return ri.indexOf(roles[a.id] || 'buerger') - ri.indexOf(roles[b.id] || 'buerger')
  })

  return (
    <div style={{ padding: '1.5rem 1.25rem', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
      <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: '1.5rem' }}>Runde {gs.roundNumber} beendet!</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.5rem' }}>
        {ordered.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 12,
            background: roles[p.id] === 'arschloch' ? '#FCEBEB' : roles[p.id] === 'president' ? '#EEEDFE' : '#f8f8f8',
            border: roles[p.id] === 'arschloch' ? '1px solid #F09595' : roles[p.id] === 'president' ? '1px solid #AFA9EC' : '1px solid #eee',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: p.color.fill, border: `2px solid ${p.color.stroke}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 500, color: p.color.text,
            }}>
              {p.name.slice(0,2).toUpperCase()}
            </div>
            <span style={{ flex: 1, fontWeight: 500, textAlign: 'left' }}>{p.name}</span>
            <span style={{ fontSize: 13 }}>{ROLE_LABEL[roles[p.id]] || '👤 Bürger'}</span>
          </div>
        ))}
      </div>

      {arsPly && (
        <div style={{ background: '#FCEBEB', border: '1px solid #F09595', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#A32D2D' }}>
            💩 {arsPly.name} ist das Arschloch und trinkt {drinkCount}x!
          </p>
        </div>
      )}

      <button onClick={onNewRound} style={{
        width: '100%', padding: 14, borderRadius: 10,
        background: '#534AB7', border: 'none', color: '#fff',
        fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        Nächste Runde →
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Tricks Phase
// ─────────────────────────────────────────────────────────────────────────────
function TricksPhase({ gs, players, onUpdate, onRoundEnd }) {
  const [sel, setSel] = useState([])

  const cur     = players.find(p => p.id === gs.currentId)
  const hand    = gs.hands[gs.currentId] || []
  const valid   = canPlay(sel, gs.pileTopValue, gs.pileCount, gs.revolution)

  const toggle = (card) => {
    setSel(prev =>
      prev.find(c => c.id === card.id) ? prev.filter(c => c.id !== card.id) : [...prev, card]
    )
  }

  const doPlay = () => {
    if (!valid) return
    const isFour = sel.length === 4 && sel.every(c => c.value === sel[0].value)
    const newRevolution = isFour ? !gs.revolution : gs.revolution
    const newHands = { ...gs.hands }
    newHands[gs.currentId] = hand.filter(c => !sel.find(s => s.id === c.id))

    let newFinishedIds  = [...gs.finishedIds]
    let newActiveIds    = [...gs.activeIds]
    if (newHands[gs.currentId].length === 0) {
      newFinishedIds = [...newFinishedIds, gs.currentId]
      newActiveIds   = newActiveIds.filter(id => id !== gs.currentId)
    }

    // Check if round ends (1 player left)
    if (newActiveIds.length <= 1) {
      const newGs = {
        ...gs,
        hands:       newHands,
        finishedIds: newFinishedIds,
        activeIds:   newActiveIds,
        phase:       'round-end',
        revolution:  newRevolution,
      }
      onUpdate(newGs)
      setSel([])
      return
    }

    // If four of a kind (bomb): clear pile, same player goes again (or next if they finished)
    let newPassedIds = [...gs.passedIds]
    let newPile      = sel
    let newPileCount = sel.length
    let newTopValue  = sel[0].value
    let nextId       = gs.currentId

    if (isFour) {
      newPile      = []
      newPileCount = 0
      newTopValue  = null
      newPassedIds = []
    }

    // Advance to next player if current finished
    if (newHands[gs.currentId].length === 0) {
      nextId = nextActive(gs.currentId, newPassedIds, newActiveIds)
    } else if (!isFour) {
      nextId = nextActive(gs.currentId, newPassedIds, newActiveIds)
    }

    onUpdate({
      ...gs,
      hands:        newHands,
      pile:         newPile,
      pileCount:    newPileCount,
      pileTopValue: isFour ? null : newTopValue,
      lastPlayedBy: gs.currentId,
      currentId:    nextId,
      passedIds:    newPassedIds,
      finishedIds:  newFinishedIds,
      activeIds:    newActiveIds,
      revolution:   newRevolution,
    })
    setSel([])
  }

  const doPass = () => {
    const newPassedIds = [...gs.passedIds, gs.currentId]
    const remaining    = gs.activeIds.filter(id => !newPassedIds.includes(id))

    // All active players passed → clear trick
    if (remaining.length === 0) {
      const starterId = gs.lastPlayedBy || gs.activeIds[0]
      onUpdate({
        ...gs,
        pile:         [],
        pileCount:    0,
        pileTopValue: null,
        lastPlayedBy: null,
        currentId:    starterId,
        passedIds:    [],
      })
    } else {
      onUpdate({
        ...gs,
        passedIds: newPassedIds,
        currentId: nextActive(gs.currentId, newPassedIds, gs.activeIds),
      })
    }
    setSel([])
  }

  const othersInOrder = players.filter(p => p.id !== gs.currentId && gs.activeIds.includes(p.id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
        <span style={{ fontSize: 13, color: '#888' }}>Runde {gs.roundNumber}</span>
        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, background: gs.revolution ? '#FAECE7' : '#f0f0f0', color: gs.revolution ? '#D85A30' : '#888', fontWeight: 500 }}>
          {gs.revolution ? '⚡ Revolution!' : 'Normal'}
        </span>
        <span style={{ fontSize: 12, color: '#888' }}>{gs.activeIds.length} Spieler aktiv</span>
      </div>

      {/* Other players */}
      <div style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {othersInOrder.map(p => {
          const pHand    = gs.hands[p.id] || []
          const isPassed = gs.passedIds.includes(p.id)
          return (
            <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: isPassed ? 0.4 : 1 }}>
              <div style={{ display: 'flex', gap: -6 }}>
                {pHand.slice(0, Math.min(pHand.length, 8)).map((_, i) => (
                  <div key={i} style={{ marginLeft: i > 0 ? -10 : 0 }}>
                    <Card card={null} faceDown small />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 11, color: '#888' }}>{p.name} ({pHand.length}) {isPassed ? '— passt' : ''}</span>
            </div>
          )
        })}
        {othersInOrder.length === 0 && (
          <span style={{ fontSize: 13, color: '#aaa' }}>Alle anderen Spieler sind fertig</span>
        )}
      </div>

      {/* Pile */}
      <div style={{
        margin: '0 1.25rem',
        minHeight: 90,
        borderRadius: 14,
        background: '#f0f4f0',
        border: '1px solid #d0ddd0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, flexWrap: 'wrap',
        padding: '1rem',
      }}>
        {gs.pile.length === 0 ? (
          <span style={{ color: '#aaa', fontSize: 13 }}>Neuer Stich — beliebige Karte spielen</span>
        ) : (
          gs.pile.map(card => <Card key={card.id} card={card} small={false} />)
        )}
      </div>

      {/* Current player */}
      <div style={{ padding: '0.75rem 1.25rem 0.5rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: cur?.color.fill, border: `1px solid ${cur?.color.stroke}`,
          borderRadius: 999, padding: '6px 16px',
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: cur?.color.text }}>
            {cur?.name} ist dran
          </span>
        </div>
      </div>

      {/* Hand */}
      <div style={{
        padding: '0.75rem 1.25rem',
        display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center',
        minHeight: 80,
      }}>
        {hand.map(card => (
          <Card
            key={card.id}
            card={card}
            selected={!!sel.find(c => c.id === card.id)}
            onClick={() => toggle(card)}
          />
        ))}
      </div>

      {/* Actions */}
      <div style={{ padding: '0.5rem 1.25rem 1.5rem', display: 'flex', gap: 10 }}>
        <button
          onClick={doPass}
          style={{
            flex: 1, padding: '13px', borderRadius: 10,
            background: '#f8f8f8', border: '1px solid #ddd',
            color: '#555', fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Passen
        </button>
        <button
          onClick={doPlay}
          disabled={!valid}
          style={{
            flex: 2, padding: '13px', borderRadius: 10,
            background: valid ? '#534AB7' : '#eee',
            border: 'none',
            color: valid ? '#fff' : '#aaa',
            fontSize: 14, fontWeight: 500,
            cursor: valid ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
          }}
        >
          {sel.length ? `${sel.length}x ${sel[0]?.label}${sel[0]?.suit} spielen` : 'Karte auswählen'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────
export default function Arschloch({ players, gameState, onUpdate }) {
  const playerIds = players.map(p => p.id)

  const handleNewRound = () => {
    const roles = computeRoles(
      gameState.finishedIds,
      gameState.activeIds.length ? gameState.activeIds : playerIds
    )
    onUpdate(initRound(playerIds, roles, (gameState.roundNumber || 1) + 1))
  }

  // Not started yet
  if (!gameState) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', gap: 16 }}>
        <div style={{ fontSize: 40 }}>🃏</div>
        <p style={{ fontWeight: 500, fontSize: 16, margin: 0 }}>Arschloch</p>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{players.length} Spieler · {Math.floor(52 / players.length)} Karten/Spieler</p>
        <button
          onClick={() => onUpdate(initRound(playerIds, null, 1))}
          style={{
            padding: '13px 32px', borderRadius: 10,
            background: '#534AB7', border: 'none', color: '#fff',
            fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Karten austeilen
        </button>
      </div>
    )
  }

  if (gameState.phase === 'exchange') {
    return <ExchangePhase gs={gameState} players={players} onUpdate={onUpdate} />
  }

  if (gameState.phase === 'round-end') {
    return <RoundEnd gs={gameState} players={players} onNewRound={handleNewRound} />
  }

  return (
    <TricksPhase
      gs={gameState}
      players={players}
      onUpdate={onUpdate}
      onRoundEnd={() => {}}
    />
  )
}
