import { useState } from 'react'

const CSS = `
  .ob-root {
    min-height: 100dvh; background: #0b1520;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 2rem 1.5rem; font-family: inherit; color: #e2e8f0;
    overflow: hidden; position: relative;
  }
  @keyframes ob-card-reveal {
    from { transform: rotateY(90deg) scale(0.8); opacity:0; }
    to   { transform: rotateY(0) scale(1); opacity:1; }
  }
  @keyframes ob-slide-up {
    from { transform:translateY(30px); opacity:0; }
    to   { transform:translateY(0); opacity:1; }
  }
  @keyframes ob-float { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-12px) rotate(3deg)} }
  .ob-deco-card {
    position:absolute; border-radius:10px; background:white;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    box-shadow:0 12px 40px rgba(0,0,0,0.5); pointer-events:none; opacity:0.1;
    animation: ob-float var(--dur)s ease-in-out var(--del)s infinite;
  }
  .ob-logo-block { animation: ob-card-reveal 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
  .ob-form-block { animation: ob-slide-up 0.5s ease 0.5s both; width:100%; max-width:360px; }
  .ob-input {
    width:100%; background:rgba(255,255,255,0.08);
    border:1.5px solid rgba(255,255,255,0.15);
    border-radius:14px; padding:16px 20px; font-size:22px;
    color:#fff; font-family:inherit; outline:none;
    box-sizing:border-box; text-align:center;
    transition:border-color 0.15s, box-shadow 0.15s;
  }
  .ob-input:focus { border-color:#f59e0b; box-shadow:0 0 0 3px rgba(245,158,11,0.22); }
  .ob-input::placeholder { color:rgba(255,255,255,0.22); font-size:18px; }
  @keyframes ob-btn-pulse {
    0%,100% { box-shadow:0 8px 24px rgba(245,158,11,0.3); }
    50%      { box-shadow:0 12px 36px rgba(245,158,11,0.55); }
  }
  .ob-btn {
    width:100%; padding:17px; border-radius:14px; border:none;
    background:linear-gradient(135deg,#f59e0b,#d97706); color:#1a0f00;
    font-size:17px; font-weight:700; cursor:pointer; font-family:inherit;
    letter-spacing:0.01em;
    transition:transform 0.15s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s;
    animation:ob-btn-pulse 2.5s ease infinite;
  }
  .ob-btn:disabled { background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.25); cursor:not-allowed; animation:none; box-shadow:none; }
  .ob-btn:not(:disabled):hover { transform:translateY(-2px); }
  .ob-btn:not(:disabled):active { transform:scale(0.97); }
`

const DECO = [
  { suit:'♠', val:'A', x:5,  y:10, w:60, rot:-15, dur:9,  del:0 },
  { suit:'♥', val:'K', x:80, y:15, w:52, rot:12,  dur:11, del:2 },
  { suit:'♦', val:'Q', x:10, y:70, w:48, rot:8,   dur:10, del:1 },
  { suit:'♣', val:'J', x:78, y:65, w:56, rot:-10, dur:12, del:3 },
]

export default function OnboardingScreen({ onSave }) {
  const [name, setName] = useState('')
  const ready = name.trim().length >= 2

  return (
    <>
      <style>{CSS}</style>
      <div className="ob-root">
        {DECO.map((d,i) => (
          <div key={i} className="ob-deco-card" style={{
            left:`${d.x}%`, top:`${d.y}%`, width:d.w, height:d.w*1.42,
            transform:`rotate(${d.rot}deg)`, '--dur':d.dur, '--del':d.del,
          }}>
            <span style={{fontSize:d.w*0.22,fontWeight:700,color:'#111',lineHeight:1}}>{d.val}</span>
            <span style={{fontSize:d.w*0.38,color: d.suit==='♥'||d.suit==='♦'?'#dc2626':'#111',lineHeight:1}}>{d.suit}</span>
          </div>
        ))}

        <div className="ob-logo-block" style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.5em', color:'#f59e0b', marginBottom:4 }}>THE</div>
          <div style={{ fontSize:52, fontWeight:800, color:'#fff', letterSpacing:-1, lineHeight:1 }}>CARDS</div>
          <div style={{ width:40, height:2, background:'#f59e0b', margin:'12px auto 0', borderRadius:2 }}/>
        </div>

        <div className="ob-form-block">
          <p style={{ textAlign:'center', fontSize:15, color:'rgba(255,255,255,0.55)', margin:'0 0 1.25rem' }}>
            Wie heißt du?
          </p>
          <input
            className="ob-input"
            type="text" autoFocus
            placeholder="Dein Name"
            value={name}
            onChange={e => setName(e.target.value.slice(0,16))}
            onKeyDown={e => e.key==='Enter' && ready && onSave(name)}
            maxLength={16}
            style={{ marginBottom: 12 }}
          />
          <button className="ob-btn" onClick={() => onSave(name)} disabled={!ready}>
            Loslegen →
          </button>
          <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:12 }}>
            Dein Name wird lokal auf diesem Gerät gespeichert
          </p>
        </div>
      </div>
    </>
  )
}
