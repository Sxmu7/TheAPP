import { GAMES } from '../constants'

export default function GameSelectScreen({ players, onSelectGame, onBack }) {
  return (
    <div className="screen fade-in">
      {/* Header */}
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          12,
          marginBottom: '1.25rem',
        }}
      >
        <button className="icon-btn" onClick={onBack} aria-label="Zurück">
          <i className="ti ti-arrow-left" />
        </button>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 500 }}>Spiel wählen</h2>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
            {players.length} Spieler bereit
          </p>
        </div>
      </div>

      {/* Player pills */}
      <div
        style={{
          display:      'flex',
          gap:          6,
          flexWrap:     'wrap',
          marginBottom: '1.5rem',
        }}
      >
        {players.map((p) => (
          <span
            key={p.id}
            className="pill"
            style={{
              background: p.color.fill,
              border:     `1px solid ${p.color.stroke}`,
              color:      p.color.text,
            }}
          >
            {p.name}
          </span>
        ))}
      </div>

      {/* Game grid */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:                 12,
        }}
      >
        {GAMES.map((g) => (
          <div
            key={g.id}
            className="game-card"
            onClick={() => onSelectGame(g)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectGame(g)}
            aria-label={g.name}
          >
            {/* Icon */}
            <div
              style={{
                width:          50,
                height:         50,
                borderRadius:   'var(--r-md)',
                background:     'var(--primary-light)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                margin:         '0 auto 12px',
                fontSize:       26,
              }}
            >
              {g.emoji}
            </div>

            <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
              {g.name}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10 }}>
              {g.desc}
            </p>

            {/* Badge */}
            <span
              style={{
                fontSize:     11,
                padding:      '3px 10px',
                borderRadius: 'var(--r-full)',
                background:   'var(--bg-2)',
                color:        'var(--text-3)',
              }}
            >
              {g.ready ? 'Spielen' : 'In Kürze'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
