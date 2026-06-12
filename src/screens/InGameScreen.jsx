import { useState } from 'react'
import Avatar from '../components/Avatar'

// ─────────────────────────────────────────────────────────────────────────────
// GameContent — swap this out per game.type once you add real games.
// ─────────────────────────────────────────────────────────────────────────────
function GameContent({ game, currentPlayer }) {
  // Placeholder — you'll replace this switch with your actual game components.
  switch (game?.type) {
    // case 'truth-or-dare':
    //   return <TruthOrDareGame player={currentPlayer} />
    // case 'never-have-i':
    //   return <NeverHaveIGame player={currentPlayer} />
    default:
      return (
        <div
          style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            10,
            color:          'var(--text-2)',
          }}
        >
          <div style={{ fontSize: 32 }}>🎮</div>
          <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>
            Spielinhalt erscheint hier
          </p>
          <p style={{ fontSize: 12, margin: 0, color: 'var(--text-3)' }}>
            Trinkspiele werden bald hinzugefügt
          </p>
        </div>
      )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ScoreBoard (collapsible)
// ─────────────────────────────────────────────────────────────────────────────
function ScoreBoard({ players, onChangeDrinks }) {
  return (
    <div
      className="fade-in"
      style={{
        background:    'var(--bg-2)',
        borderRadius:  'var(--r-lg)',
        padding:       '1rem 1.25rem',
        marginBottom:  '1.25rem',
      }}
    >
      <p
        style={{
          fontSize:      11,
          fontWeight:    500,
          letterSpacing: '0.08em',
          color:         'var(--text-2)',
          marginBottom:  '0.75rem',
        }}
      >
        GETRUNKEN
      </p>

      {players.map((p) => (
        <div
          key={p.id}
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:         10,
            marginBottom: 8,
          }}
        >
          <Avatar player={p} size={28} />
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
            {p.name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => onChangeDrinks(p.id, -1)}
              aria-label="Minus"
              style={{
                width:        26,
                height:       26,
                borderRadius: '50%',
                background:   'var(--bg)',
                border:       '1px solid var(--border-2)',
                cursor:       'pointer',
                fontSize:     16,
                fontFamily:   'inherit',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                color:        'var(--text-2)',
              }}
            >
              −
            </button>
            <span
              style={{
                fontSize:   14,
                fontWeight: 500,
                minWidth:   20,
                textAlign:  'center',
              }}
            >
              {p.drinks}
            </span>
            <button
              onClick={() => onChangeDrinks(p.id, 1)}
              aria-label="Plus"
              style={{
                width:        26,
                height:       26,
                borderRadius: '50%',
                background:   'var(--bg)',
                border:       '1px solid var(--border-2)',
                cursor:       'pointer',
                fontSize:     16,
                fontFamily:   'inherit',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                color:        'var(--text-2)',
              }}
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// InGameScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function InGameScreen({
  game,
  players,
  playerIdx,
  onNextPlayer,
  onChangeDrinks,
  onBack,
}) {
  const [showScores, setShowScores] = useState(false)

  const currentPlayer = players[playerIdx]
  const nextPlayer    = players[(playerIdx + 1) % players.length]

  return (
    <div className="screen fade-in">
      {/* Header */}
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          12,
          marginBottom: '1.5rem',
        }}
      >
        <button className="icon-btn" onClick={onBack} aria-label="Zurück">
          <i className="ti ti-arrow-left" />
        </button>
        <h2 style={{ flex: 1, fontSize: 18, fontWeight: 500 }}>
          {game?.name}
        </h2>
        <button
          className="small-btn"
          onClick={() => setShowScores((v) => !v)}
        >
          🍺 Scores
        </button>
      </div>

      {/* Collapsible scores */}
      {showScores && (
        <ScoreBoard players={players} onChangeDrinks={onChangeDrinks} />
      )}

      {/* Current player card */}
      <div
        key={currentPlayer.id}
        className="fade-in"
        style={{
          background:    currentPlayer.color.fill,
          border:        `1px solid ${currentPlayer.color.stroke}`,
          borderRadius:  'var(--r-xl)',
          padding:       '2rem',
          textAlign:     'center',
          marginBottom:  '1.25rem',
        }}
      >
        <p
          style={{
            margin:        '0 0 1rem',
            fontSize:      11,
            fontWeight:    500,
            letterSpacing: '0.1em',
            color:         currentPlayer.color.text,
          }}
        >
          AN DER REIHE
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Avatar player={currentPlayer} size={72} />
        </div>
        <p
          style={{
            fontSize:   28,
            fontWeight: 500,
            color:      currentPlayer.color.text,
          }}
        >
          {currentPlayer.name}
        </p>
      </div>

      {/* Game content */}
      <div
        style={{
          minHeight:     180,
          background:    'var(--bg)',
          border:        '1px dashed var(--border-2)',
          borderRadius:  'var(--r-lg)',
          display:       'flex',
          alignItems:    'center',
          justifyContent: 'center',
          marginBottom:  '1.25rem',
          padding:       '1.5rem',
        }}
      >
        <GameContent game={game} currentPlayer={currentPlayer} />
      </div>

      {/* Player dots */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'center',
          gap:            8,
          marginBottom:   '1.25rem',
          flexWrap:       'wrap',
        }}
      >
        {players.map((p, i) => {
          const active = i === playerIdx
          return (
            <div
              key={p.id}
              title={p.name}
              style={{
                width:          active ? 38 : 30,
                height:         active ? 38 : 30,
                borderRadius:   '50%',
                background:     active ? p.color.fill : 'var(--bg-2)',
                border:         active
                  ? `2px solid ${p.color.stroke}`
                  : '1px solid var(--border)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       10,
                fontWeight:     500,
                color:          active ? p.color.text : 'var(--text-3)',
                transition:     'all 0.2s',
                userSelect:     'none',
              }}
            >
              {p.name.slice(0, 2).toUpperCase()}
            </div>
          )
        })}
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => onChangeDrinks(currentPlayer.id, 1)}
          style={{
            padding:      '13px 16px',
            borderRadius: 'var(--r-md)',
            background:   'var(--bg)',
            border:       '1px solid var(--border-2)',
            color:        'var(--text)',
            fontSize:     14,
            fontWeight:   500,
            cursor:       'pointer',
            whiteSpace:   'nowrap',
            fontFamily:   'inherit',
            transition:   'background 0.12s',
          }}
        >
          🍺 Trinken ({currentPlayer.drinks})
        </button>

        <button
          className="btn-primary"
          onClick={onNextPlayer}
          style={{ flex: 1 }}
        >
          Weiter → {nextPlayer.name}
        </button>
      </div>
    </div>
  )
}
