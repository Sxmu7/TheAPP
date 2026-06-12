import { useState } from 'react'
import Avatar from '../components/Avatar'

export default function LobbyScreen({
  code,
  players,
  onAddPlayer,
  onRemovePlayer,
  onStart,
  onBack,
}) {
  const [name, setCopied_name] = useState('')
  const [copied, setCopied]    = useState(false)

  const canAdd   = name.trim().length > 0 && players.length < 8
  const canStart = players.length >= 2

  const handleAdd = () => {
    if (!canAdd) return
    onAddPlayer(name.trim())
    setCopied_name('')
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="screen fade-in">
      {/* Header */}
      <div
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           12,
          marginBottom:  '1.5rem',
        }}
      >
        <button className="icon-btn" onClick={onBack} aria-label="Zurück">
          <i className="ti ti-arrow-left" />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 500 }}>Lobby</h2>
      </div>

      {/* Room code card */}
      <div
        style={{
          background:    'var(--primary-light)',
          border:        '1px solid var(--primary-border)',
          borderRadius:  'var(--r-lg)',
          padding:       '1.25rem',
          textAlign:     'center',
          marginBottom:  '1.5rem',
        }}
      >
        <p
          style={{
            margin:        '0 0 8px',
            fontSize:      11,
            fontWeight:    500,
            letterSpacing: '0.1em',
            color:         'var(--primary)',
          }}
        >
          RAUMCODE
        </p>
        <p
          style={{
            margin:        '0 0 14px',
            fontSize:      46,
            fontWeight:    500,
            letterSpacing: '0.28em',
            color:         'var(--primary-text)',
            lineHeight:    1,
          }}
        >
          {code}
        </p>
        <button
          onClick={handleCopy}
          style={{
            background:   'none',
            border:       '1px solid var(--primary-border)',
            borderRadius: 'var(--r-sm)',
            padding:      '6px 14px',
            color:        'var(--primary)',
            fontSize:     12,
            cursor:       'pointer',
            fontFamily:   'inherit',
            transition:   'background 0.12s',
          }}
        >
          {copied ? '✓ Kopiert!' : 'Code kopieren'}
        </button>
      </div>

      {/* Add player */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label className="label">
          Spieler ({players.length}/8)
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setCopied_name(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Name eingeben…"
            maxLength={16}
            style={{ flex: 1 }}
          />
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            style={{
              padding:      '0 18px',
              height:       44,
              borderRadius: 'var(--r-md)',
              background:   canAdd ? 'var(--primary)' : 'var(--bg-2)',
              border:       'none',
              color:        canAdd ? '#fff' : 'var(--text-3)',
              fontSize:     14,
              fontWeight:   500,
              cursor:       canAdd ? 'pointer' : 'not-allowed',
              whiteSpace:   'nowrap',
              fontFamily:   'inherit',
              transition:   'background 0.12s',
              flexShrink:   0,
            }}
          >
            + Hinzufügen
          </button>
        </div>
      </div>

      {/* Player list */}
      <div style={{ marginBottom: '1.75rem' }}>
        {players.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 28, marginBottom: 8 }}>👥</div>
            <p style={{ fontSize: 14 }}>
              Noch keine Spieler — füge welche hinzu!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {players.map((p, i) => (
              <div key={p.id} className="player-row">
                <Avatar player={p} size={36} />
                <span style={{ flex: 1, fontWeight: 500, fontSize: 15 }}>
                  {p.name}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  #{i + 1}
                </span>
                <button
                  className="icon-btn"
                  onClick={() => onRemovePlayer(p.id)}
                  aria-label={`${p.name} entfernen`}
                >
                  <i className="ti ti-x" style={{ fontSize: 16 }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="btn-primary" onClick={onStart} disabled={!canStart}>
        Spiel starten →
      </button>

      {!canStart && (
        <p
          style={{
            textAlign: 'center',
            fontSize:  12,
            color:     'var(--text-3)',
            marginTop: 8,
          }}
        >
          Mindestens 2 Spieler erforderlich
        </p>
      )}
    </div>
  )
}
