import { useState } from 'react'
import Avatar        from '../components/Avatar'
import { RoomQR }   from '../components/QRCode'

export default function LobbyScreen({ code, players, isHost, onAddPlayer, onRemovePlayer, onStart, onBack, onRegenerateCode, waitingRoom }) {
  const [name,    setName]    = useState('')
  const [tab,     setTab]     = useState('code')   // 'code' | 'qr'
  const [copied,  setCopied]  = useState(false)
  const [adding,  setAdding]  = useState(false)
  const [regen,   setRegen]   = useState(false)

  const canAdd   = name.trim().length > 0 && players.length < 8 && !adding
  const canStart = players.length >= 2

  const handleAdd = async () => {
    if (!canAdd) return; setAdding(true)
    await onAddPlayer(name.trim()); setName(''); setAdding(false)
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(code).catch(()=>{})
    setCopied(true); setTimeout(()=>setCopied(false),1600)
  }

  const handleRegen = async () => {
    if (!isHost) return; setRegen(true)
    await onRegenerateCode(); setRegen(false)
  }

  return (
    <div className="screen fade-in">
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.5rem' }}>
        <button className="icon-btn" onClick={onBack}><i className="ti ti-arrow-left"/></button>
        <h2 style={{ fontSize:18, fontWeight:500 }}>Lobby</h2>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#1D9E75', boxShadow:'0 0 0 2px #E1F5EE' }}/>
          <span style={{ fontSize:12, color:'var(--text-2)' }}>Live</span>
        </div>
      </div>

      {/* Room code / QR */}
      <div style={{ background:'var(--primary-light)', border:'1px solid var(--primary-border)', borderRadius:'var(--r-lg)', padding:'1.25rem', marginBottom:'1.5rem' }}>
        {/* Tab toggle */}
        <div style={{ display:'flex', gap:6, marginBottom:'1rem' }}>
          {['code','qr'].map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1, padding:'7px', borderRadius:8, border:'none',
              background: tab===t ? 'var(--primary)' : 'transparent',
              color: tab===t ? '#fff' : 'var(--primary)',
              fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit',
              transition:'background 0.15s',
            }}>
              {t==='code' ? '🔑 Code' : '📱 QR Code'}
            </button>
          ))}
        </div>

        {tab==='code' ? (
          <div style={{ textAlign:'center' }}>
            <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:500, letterSpacing:'0.1em', color:'var(--primary)' }}>RAUMCODE</p>
            <p style={{ margin:'0 0 12px', fontSize:46, fontWeight:700, letterSpacing:'0.28em', color:'var(--primary-text)', lineHeight:1 }}>{code}</p>
            <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
              <button onClick={handleCopy} style={{ background:'none', border:'1px solid var(--primary-border)', borderRadius:8, padding:'6px 14px', color:'var(--primary)', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                {copied ? '✓ Kopiert!' : 'Code kopieren'}
              </button>
              {isHost && (
                <button onClick={handleRegen} disabled={regen} style={{ background:'none', border:'1px solid var(--primary-border)', borderRadius:8, padding:'6px 14px', color:'var(--primary)', fontSize:12, cursor:'pointer', fontFamily:'inherit', opacity:regen?0.5:1 }}>
                  {regen ? '…' : '🔄 Neu generieren'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <RoomQR roomCode={code} />
        )}
      </div>

      {/* Waiting room players */}
      {waitingRoom?.length > 0 && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:'10px 14px', marginBottom:'1rem' }}>
          <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:500, color:'var(--text-2)', letterSpacing:'0.06em' }}>WARTEN AUF NÄCHSTE RUNDE</p>
          {waitingRoom.map(p => (
            <span key={p.id} style={{ fontSize:13, color:'var(--text-2)', marginRight:8 }}>⏳ {p.name}</span>
          ))}
        </div>
      )}

      {/* Add player */}
      <div style={{ marginBottom:'1.25rem' }}>
        <label className="label">Spieler ({players.length}/8)</label>
        <div style={{ display:'flex', gap:8 }}>
          <input type="text" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAdd()} placeholder="Name eingeben…" maxLength={16} style={{ flex:1 }} disabled={adding}/>
          <button onClick={handleAdd} disabled={!canAdd} style={{
            padding:'0 18px', height:44, borderRadius:'var(--r-md)',
            background:canAdd?'var(--primary)':'var(--bg-2)', border:'none',
            color:canAdd?'#fff':'var(--text-3)', fontSize:14, fontWeight:500,
            cursor:canAdd?'pointer':'not-allowed', whiteSpace:'nowrap', fontFamily:'inherit', flexShrink:0,
            transition:'background 0.12s, transform 0.1s',
          }}>
            {adding?'…':'+ Hinzufügen'}
          </button>
        </div>
      </div>

      {/* Players */}
      <div style={{ marginBottom:'1.75rem' }}>
        {players.length===0 ? (
          <div className="empty-state"><div style={{fontSize:28,marginBottom:8}}>👥</div><p style={{fontSize:14}}>Noch keine Spieler</p></div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {players.map((p,i) => (
              <div key={p.id} className="player-row fade-in">
                <Avatar player={p} size={36}/>
                <span style={{ flex:1, fontWeight:500 }}>{p.name}</span>
                <span style={{ fontSize:12, color:'var(--text-3)' }}>#{i+1}</span>
                {isHost && <button className="icon-btn" onClick={()=>onRemovePlayer(p.id)} aria-label="Entfernen"><i className="ti ti-x" style={{fontSize:16}}/></button>}
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="btn-primary" onClick={onStart} disabled={!canStart}>Spiel starten →</button>
      {!canStart && <p style={{ textAlign:'center', fontSize:12, color:'var(--text-3)', marginTop:8 }}>Mindestens 2 Spieler</p>}
    </div>
  )
}
