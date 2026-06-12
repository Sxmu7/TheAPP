import { useState } from 'react'
import Avatar    from '../components/Avatar'
import Arschloch from '../games/Arschloch'

function ScoreBoard({ players, onChangeDrinks }) {
  return (
    <div className="fade-in" style={{ background:'var(--bg-2)', borderRadius:'var(--r-lg)', padding:'1rem 1.25rem', marginBottom:'1.25rem' }}>
      <p style={{ fontSize:11, fontWeight:500, letterSpacing:'0.08em', color:'var(--text-2)', marginBottom:'0.75rem' }}>GETRUNKEN</p>
      {players.map(p => (
        <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <Avatar player={p} size={28} />
          <span style={{ flex:1, fontSize:14, fontWeight:500 }}>{p.name}</span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            {[-1,1].map(delta => (
              <button key={delta} onClick={() => onChangeDrinks(p.id, delta)} style={{
                width:26, height:26, borderRadius:'50%',
                background:'var(--bg)', border:'1px solid var(--border-2)',
                cursor:'pointer', fontSize:16, fontFamily:'inherit',
                display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-2)',
              }}>{delta>0?'+':'−'}</button>
            ))}
            <span style={{ fontSize:14, fontWeight:500, minWidth:20, textAlign:'center' }}>{p.drinks}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Game content router ───────────────────────────────────────────────────────
function GameContent({ game, players, gameState, onSaveGameState }) {
  switch (game?.type) {
    case 'arschloch':
      return (
        <Arschloch
          players={players}
          gameState={gameState}
          onUpdate={onSaveGameState}
        />
      )
    default:
      return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, color:'var(--text-2)', padding:'2rem 0' }}>
          <div style={{ fontSize:32 }}>🎮</div>
          <p style={{ fontSize:14, fontWeight:500, margin:0 }}>Spielinhalt erscheint hier</p>
          <p style={{ fontSize:12, margin:0, color:'var(--text-3)' }}>Nächste Spiele kommen bald!</p>
        </div>
      )
  }
}

export default function InGameScreen({ game, players, playerIdx, gameState, onNextPlayer, onChangeDrinks, onSaveGameState, onBack }) {
  const [showScores, setShowScores] = useState(false)
  const isCardGame = game?.type === 'arschloch'  // card games manage their own turn flow

  return (
    <div style={{ maxWidth:480, margin:'0 auto', paddingBottom:'2rem' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'1.25rem 1.25rem 0' }}>
        <button className="icon-btn" onClick={onBack} aria-label="Zurück">
          <i className="ti ti-arrow-left" />
        </button>
        <h2 style={{ flex:1, fontSize:18, fontWeight:500 }}>{game?.name}</h2>
        <button className="small-btn" onClick={() => setShowScores(v => !v)}>🍺 Scores</button>
      </div>

      <div style={{ padding:'0 1.25rem', marginTop:'1rem' }}>
        {showScores && <ScoreBoard players={players} onChangeDrinks={onChangeDrinks} />}
      </div>

      {/* Game content */}
      <GameContent
        game={game}
        players={players}
        gameState={gameState}
        onSaveGameState={onSaveGameState}
      />

      {/* Pass-the-phone controls (only for non-card games) */}
      {!isCardGame && (() => {
        const cur  = players[playerIdx]
        const next = players[(playerIdx + 1) % players.length]
        if (!cur) return null
        return (
          <div style={{ padding:'0 1.25rem', marginTop:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:'1rem', flexWrap:'wrap' }}>
              {players.map((p,i) => {
                const active = i === playerIdx
                return (
                  <div key={p.id} title={p.name} style={{
                    width: active?38:30, height: active?38:30, borderRadius:'50%',
                    background: active?p.color.fill:'var(--bg-2)',
                    border: active?`2px solid ${p.color.stroke}`:'1px solid var(--border)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:10, fontWeight:500,
                    color: active?p.color.text:'var(--text-3)',
                    transition:'all 0.2s',
                  }}>
                    {p.name.slice(0,2).toUpperCase()}
                  </div>
                )
              })}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => onChangeDrinks(cur.id, 1)} style={{
                padding:'13px 16px', borderRadius:'var(--r-md)',
                background:'var(--bg)', border:'1px solid var(--border-2)',
                color:'var(--text)', fontSize:14, fontWeight:500,
                cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit',
              }}>🍺 Trinken ({cur.drinks})</button>
              <button className="btn-primary" onClick={onNextPlayer} style={{ flex:1 }}>
                Weiter → {next?.name}
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
