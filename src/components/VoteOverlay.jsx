// VoteOverlay — animated "Letzte Runde?" vote popup shown to all players

const CSS = `
  .vote-backdrop {
    position: fixed; inset: 0; z-index: 999;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(6px);
    display: flex; align-items: flex-end; justify-content: center;
    padding: 0 0 env(safe-area-inset-bottom,0);
  }
  @keyframes vote-slide-up {
    from { transform: translateY(100%) scale(0.96); opacity:0; }
    to   { transform: translateY(0) scale(1); opacity:1; }
  }
  .vote-card {
    width: 100%; max-width: 480px;
    background: #131e2e;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px 24px 0 0;
    padding: 1.5rem 1.5rem 2rem;
    color: #e2e8f0;
    animation: vote-slide-up 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .vote-handle {
    width: 40px; height: 4px; border-radius: 2px;
    background: rgba(255,255,255,0.2);
    margin: 0 auto 1.25rem;
  }
  .vote-btn {
    flex: 1; padding: 16px 12px; border-radius: 14px; border: none;
    font-family: inherit; font-size: 16px; font-weight: 700;
    cursor: pointer; transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s;
  }
  .vote-btn:hover  { transform: translateY(-2px); }
  .vote-btn:active { transform: scale(0.96); }
  .vote-btn:disabled { opacity: 0.4; cursor: default; transform: none; }
  .vote-yes { background: linear-gradient(135deg,#22c55e,#16a34a); color:#fff; box-shadow:0 6px 20px rgba(34,197,94,0.35); }
  .vote-no  { background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15) !important; color:rgba(255,255,255,0.7); }
  @keyframes vote-result {
    from { transform:scale(0.8); opacity:0; }
    to   { transform:scale(1);   opacity:1; }
  }
  .vote-result { animation: vote-result 0.4s cubic-bezier(0.34,1.56,0.64,1) both; text-align:center; padding:1rem 0; }
`

export default function VoteOverlay({ vote, players, myPlayerId, onVote, result }) {
  if (!vote?.active && !result) return null

  const total    = players.length
  const yesVotes = (vote?.yes||[]).length
  const noVotes  = (vote?.no||[]).length
  const voted    = (vote?.yes||[]).includes(myPlayerId) || (vote?.no||[]).includes(myPlayerId)
  const initiator = players.find(p => p.id === vote?.initiatedBy)

  return (
    <>
      <style>{CSS}</style>
      <div className="vote-backdrop">
        <div className="vote-card">
          <div className="vote-handle"/>

          {result ? (
            <div className="vote-result">
              <div style={{ fontSize:52, marginBottom:12 }}>{result==='yes'?'🏁':'🎮'}</div>
              <h3 style={{ fontSize:20, fontWeight:700, margin:'0 0 6px' }}>
                {result==='yes' ? 'Letzte Runde!' : 'Weiterspielen!'}
              </h3>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, margin:0 }}>
                {result==='yes' ? 'Das war die letzte Runde — Danke fürs Spielen!' : 'Die Mehrheit möchte weiterspielen.'}
              </p>
            </div>
          ) : (
            <>
              <div style={{ textAlign:'center', marginBottom:'1.25rem' }}>
                <div style={{ fontSize:38, marginBottom:8 }}>🏁</div>
                <h3 style={{ fontSize:19, fontWeight:700, margin:'0 0 6px' }}>Letzte Runde?</h3>
                <p style={{ color:'rgba(255,255,255,0.45)', fontSize:13, margin:0 }}>
                  {initiator?.name} möchte das Spiel beenden
                </p>
              </div>

              {/* Vote progress */}
              <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:12, padding:'12px 16px', marginBottom:'1.25rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13 }}>
                  <span style={{ color:'#22c55e', fontWeight:500 }}>✓ Dafür: {yesVotes}</span>
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>{yesVotes+noVotes}/{total} abgestimmt</span>
                  <span style={{ color:'rgba(255,255,255,0.5)', fontWeight:500 }}>✗ Dagegen: {noVotes}</span>
                </div>
                <div style={{ height:6, background:'rgba(255,255,255,0.1)', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:'#22c55e', borderRadius:3, width:`${total>0?(yesVotes/total)*100:0}%`, transition:'width 0.4s ease' }}/>
                </div>
                <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
                  {players.map(p => {
                    const hasYes = (vote?.yes||[]).includes(p.id)
                    const hasNo  = (vote?.no||[]).includes(p.id)
                    return (
                      <div key={p.id} style={{
                        padding:'3px 10px', borderRadius:999, fontSize:12, fontWeight:500,
                        background: hasYes?'rgba(34,197,94,0.15)': hasNo?'rgba(239,68,68,0.12)':'rgba(255,255,255,0.06)',
                        border:`1px solid ${hasYes?'rgba(34,197,94,0.4)':hasNo?'rgba(239,68,68,0.3)':'rgba(255,255,255,0.1)'}`,
                        color: hasYes?'#86efac': hasNo?'#fca5a5':'rgba(255,255,255,0.4)',
                      }}>
                        {hasYes?'✓ ':hasNo?'✗ ':''}{p.name}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button className="vote-btn vote-no"  style={{ border:'1px solid' }} onClick={()=>onVote('no')}  disabled={voted}>✗ Dagegen</button>
                <button className="vote-btn vote-yes" onClick={()=>onVote('yes')} disabled={voted}>✓ Letzte Runde</button>
              </div>
              {voted && <p style={{ textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:10 }}>Du hast bereits abgestimmt</p>}
            </>
          )}
        </div>
      </div>
    </>
  )
}
