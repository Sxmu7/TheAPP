const CSS = `
  @keyframes wr-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
  @keyframes wr-dots { 0%{opacity:0.3} 50%{opacity:1} 100%{opacity:0.3} }
  .wr-dot { animation: wr-dots 1.4s ease infinite; }
  .wr-dot:nth-child(2){animation-delay:0.2s}
  .wr-dot:nth-child(3){animation-delay:0.4s}
`

export default function WaitingRoomScreen({ playerName, roomCode, players, currentGame }) {
  return (
    <>
      <style>{CSS}</style>
      <div style={{
        minHeight:'100dvh', background:'#0b1520', display:'flex',
        flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:'2rem', textAlign:'center', color:'#e2e8f0', fontFamily:'inherit',
      }}>
        <div style={{ fontSize:56, marginBottom:16, animation:'wr-pulse 2s ease infinite' }}>⏳</div>
        <h2 style={{ fontSize:22, fontWeight:600, margin:'0 0 8px' }}>Warteraum</h2>
        <p style={{ color:'rgba(255,255,255,0.5)', margin:'0 0 2rem', fontSize:14 }}>
          Du wirst in der nächsten Runde automatisch hinzugefügt
        </p>

        <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, padding:'1rem 1.5rem', marginBottom:'1.5rem', width:'100%', maxWidth:360 }}>
          <p style={{ margin:'0 0 4px', fontSize:11, letterSpacing:'0.1em', color:'rgba(255,255,255,0.35)' }}>AKTUELLES SPIEL</p>
          <p style={{ margin:0, fontWeight:600, fontSize:16 }}>{currentGame?.name || 'Läuft…'}</p>
          <p style={{ margin:'8px 0 0', fontSize:13, color:'rgba(255,255,255,0.45)' }}>{players.length} Spieler aktiv</p>
        </div>

        <div style={{ display:'flex', gap:6, marginBottom:'2rem', flexWrap:'wrap', justifyContent:'center' }}>
          {players.map(p => (
            <span key={p.id} style={{ padding:'4px 12px', borderRadius:999, background:p.color.fill, border:`1px solid ${p.color.stroke}`, fontSize:12, fontWeight:500, color:p.color.text }}>
              {p.name}
            </span>
          ))}
        </div>

        <div style={{ display:'flex', gap:6, alignItems:'center', color:'rgba(255,255,255,0.35)', fontSize:14 }}>
          <span>Warte auf nächste Runde</span>
          <span className="wr-dot">.</span><span className="wr-dot">.</span><span className="wr-dot">.</span>
        </div>
      </div>
    </>
  )
}
