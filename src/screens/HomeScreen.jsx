import { useState } from 'react'

export default function HomeScreen({ onCreateRoom, onJoinRoom }) {
  const [joining, setJoining]   = useState(false)
  const [code, setCode]         = useState('')

  const handleJoin = () => {
    if (code.length >= 4) onJoinRoom(code)
  }

  return (
    <div
      className="screen fade-in"
      style={{ textAlign: 'center', paddingTop: '3.5rem' }}
    >
      {/* Logo */}
      <div
        style={{
          width:          84,
          height:         84,
          borderRadius:   20,
          background:     'var(--primary-light)',
          border:         '1px solid var(--primary-border)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          margin:         '0 auto 1.25rem',
          fontSize:       42,
        }}
      >
        🍺
      </div>

      <h1
        style={{
          fontSize:      40,
          fontWeight:    500,
          marginBottom:  8,
          letterSpacing: '-0.5px',
        }}
      >
        Prost!
      </h1>

      <p
        style={{
          color:         'var(--text-2)',
          marginBottom:  '2.75rem',
          fontSize:      15,
        }}
      >
        Trinkspiele mit Freunden
      </p>

      {/* Actions */}
      {!joining ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn-primary" onClick={onCreateRoom}>
            + &nbsp;Raum erstellen
          </button>
          <button className="btn-ghost" onClick={() => setJoining(true)}>
            Raum beitreten
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="text"
            autoFocus
            placeholder="XXXXX"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
            }
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            maxLength={5}
            style={{
              fontSize:      28,
              letterSpacing: '0.25em',
              textAlign:     'center',
              height:        58,
            }}
          />
          <button
            className="btn-primary"
            onClick={handleJoin}
            disabled={code.length < 4}
          >
            Beitreten
          </button>
          <button
            onClick={() => { setJoining(false); setCode('') }}
            style={{
              background: 'none',
              border:     'none',
              color:      'var(--text-2)',
              cursor:     'pointer',
              padding:    8,
              fontSize:   14,
            }}
          >
            Abbrechen
          </button>
        </div>
      )}

      <p
        style={{
          marginTop: '3.5rem',
          fontSize:  12,
          color:     'var(--text-3)',
        }}
      >
        Bitte trinkt verantwortungsvoll.
      </p>
    </div>
  )
}
