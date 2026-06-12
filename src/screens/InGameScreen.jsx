import { useState } from 'react'
import Avatar        from '../components/Avatar'
import VoteOverlay   from '../components/VoteOverlay'
import Arschloch     from '../games/Arschloch'

function ScoreBoard({ players, onChangeDrinks }) {
  return (
    <div className="fade-in" style={{ background:'var(--bg-2)', borderRadius:'var(--r-lg)', padding:'1rem 1.25rem', marginBottom:'1.25rem' }}>
      <p style={{ fontSize:11, fontWeight:500, letterSpacing:'0.08em', color:'var(--text-2)', marginBottom:'0.75rem' }}>GETRUNKEN</p>
      {players.map(p => (
        <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <Avatar player={p} size={28}/>
          <span style={{ flex:1, fontSize:14, fontWeight:500 }}>{p.name}</span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            {[-1,1].map(d => (
              <button key={d} onClick={()=>onChangeDrinks(p.id,d)} style={{ width:26, height:26, borderRadius:'50%', background:'var(--bg)', border:'1px solid var(--border-2)', cursor:'pointer', fontSize:16, fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-2)' }}>{d>0?'+':'−'}</button>
            ))}
            <span style={{ fontSize:14, fontWeight:500, minWidth:20, textAlign:'center' }}>{p.drinks}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function GameContent({ game, players, gameState, onSaveGameState }) {
  switch (game?.type) {
    case 'arschloch':
      return <Arschloch players={players} gameState={gameState} onUpdate={onSaveGameState}/>
    default:
      return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, color:'var(--text-2)', padding:'2rem 0' }}>
          <div style={{ fontSize:32 }}>🎮</div>
          <p style={{ fontSize:14, fontWeight:500, margin:0 }}>Spielinhalt erscheint hier</p>
        </div>
      )
  }
}

export default function InGameScreen({
  game, players, playerIdx, gameState, vote, isHost, myPlayerId,
  isLastRound, onNextPlayer, onChangeDrinks, onSaveGameState,
  onBack, onStartVote, onCastVote,
}) {
  const [showScores, setShowScores] = useState(false)
  const isCardGame = game?.type === 'arschloch'

  const voteResult = vote && !vote.active ? vote.result : null
  const voteActive = vote?.active

  return (
    <div style={{ maxWidth:480, margin:'0 auto', paddingBottom:'2rem' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'1.25rem 1.25rem 0' }}>
        <button className="icon-btn" onClick={onBack}><i className="ti ti-arrow-left"/></button>
        <h2 style={{ flex:1, fontSize:18, fontWeight:500 }}>{game?.name}</h2>
        {isLastRound && <span style={{ fontSize:11, padding:'3px 10px', borderRadius:999, background:'#FCEBEB', border:'1px solid #F09595', color:'#A32D2D', fontWeight:600 }}>🏁 Letzte Runde</span>}
        <button className="small-btn" onClick={()=>setShowScores(v=>!v)}>🍺 Scores</button>
      </div>

      {/* Host controls */}
      {isHost && (
        <div style={{ padding:'0.75rem 1.25rem 0', display:'flex', justifyContent:'flex-end' }}>
          <button
            onClick={onStartVote}
            disabled={voteActive}
            style={{
              background:'none', border:'1px solid var(--border-2)',
              borderRadius:8, padding:'6px 12px', fontSize:12,
              color:'var(--text-2)', cursor:'pointer', fontFamily:'inherit',
              display:'flex', alignItems:'center', gap:6,
              opacity: voteActive ? 0.4 : 1,
              transition:'background 0.12s',
            }}
          >
            🏁 Letzte Runde vorschlagen
          </button>
        </div>
      )}

      <div style={{ padding:'0 1.25rem', marginTop:'0.75rem' }}>
        {showScores && <ScoreBoard players={players} onChangeDrinks={onChangeDrinks}/>}
      </div>

      <GameContent game={game} players={players} gameState={gameState} onSaveGameState={onSaveGameState}/>

      {/* Pass-the-phone controls for non-card games */}
      {!isCardGame && (() => {
        const cur  = players[playerIdx], next = players[(playerIdx+1)%players.length]
        if (!cur) return null
        return (
          <div style={{ padding:'0 1.25rem', marginTop:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:'1rem', flexWrap:'wrap' }}>
              {players.map((p,i) => {
                const active = i===playerIdx
                return <div key={p.id} title={p.name} style={{ width:active?42:32, height:active?42:32, borderRadius:'50%', background:active?p.color.fill:'var(--bg-2)', border:active?`2.5px solid ${p.color.stroke}`:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:active?12:10, fontWeight:600, color:active?p.color.text:'var(--text-3)', transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>{p.name.slice(0,2).toUpperCase()}</div>
              })}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>onChangeDrinks(cur.id,1)} style={{ padding:'13px 16px', borderRadius:'var(--r-md)', background:'var(--bg)', border:'1px solid var(--border-2)', color:'var(--text)', fontSize:14, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit' }}>🍺 Trinken ({cur.drinks})</button>
              <button className="btn-primary" onClick={onNextPlayer} style={{ flex:1 }}>Weiter → {next?.name}</button>
            </div>
          </div>
        )
      })()}

      {/* Vote overlay */}
      {(voteActive || voteResult) && (
        <VoteOverlay
          vote={vote}
          players={players}
          myPlayerId={myPlayerId}
          onVote={onCastVote}
          result={voteResult}
        />
      )}
    </div>
  )
}
