import { useState, useEffect } from 'react'

// ── Background floating cards ─────────────────────────────────────────────────
const BG_CARDS = [
  { suit:'♠', val:'A', x:5,  y:10, rot:-18, dur:14, delay:0,   size:70 },
  { suit:'♥', val:'K', x:78, y:8,  rot:12,  dur:11, delay:1.5, size:60 },
  { suit:'♦', val:'Q', x:15, y:55, rot:-8,  dur:13, delay:3,   size:55 },
  { suit:'♣', val:'J', x:82, y:60, rot:20,  dur:15, delay:0.8, size:65 },
  { suit:'♥', val:'10',x:45, y:5,  rot:6,   dur:12, delay:2.2, size:52 },
  { suit:'♠', val:'7', x:60, y:70, rot:-14, dur:10, delay:4,   size:48 },
  { suit:'♦', val:'A', x:3,  y:78, rot:25,  dur:16, delay:1,   size:58 },
  { suit:'♣', val:'9', x:90, y:35, rot:-5,  dur:11, delay:3.5, size:44 },
  { suit:'♥', val:'K', x:35, y:82, rot:15,  dur:14, delay:5,   size:62 },
  { suit:'♠', val:'Q', x:68, y:88, rot:-20, dur:13, delay:2,   size:50 },
]

const RED = new Set(['♥','♦'])

const CSS = `
  .lnd-root {
    position: relative; overflow: hidden;
    min-height: 100dvh;
    background: #0b1520;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 2rem 1.5rem;
    font-family: inherit;
  }

  /* BG Cards */
  @keyframes lnd-card-float {
    0%   { transform: var(--tf0) scale(1);    opacity: var(--op0); }
    25%  { transform: var(--tf1) scale(1.06); opacity: var(--op1); }
    50%  { transform: var(--tf2) scale(0.96); opacity: var(--op0); }
    75%  { transform: var(--tf1) scale(1.03); opacity: var(--op1); }
    100% { transform: var(--tf0) scale(1);    opacity: var(--op0); }
  }
  .lnd-bg-card {
    position: absolute;
    border-radius: 10px;
    background: white;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 2px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    pointer-events: none;
    animation: lnd-card-float var(--dur)s ease-in-out var(--delay)s infinite;
  }

  /* Logo */
  @keyframes lnd-the-in {
    from { opacity: 0; transform: translateX(-30px) skewX(-5deg); }
    to   { opacity: 1; transform: translateX(0) skewX(0); }
  }
  @keyframes lnd-letter {
    from { opacity: 0; transform: translateY(50px) rotateX(80deg); }
    to   { opacity: 1; transform: translateY(0) rotateX(0); }
  }
  @keyframes lnd-glow {
    0%,100% { text-shadow: 0 0 30px rgba(245,158,11,0.2); }
    50%      { text-shadow: 0 0 60px rgba(245,158,11,0.55), 0 0 100px rgba(245,158,11,0.2); }
  }
  .lnd-the {
    font-size: 13px; font-weight: 700; letter-spacing: 0.45em;
    color: #f59e0b; text-transform: uppercase;
    animation: lnd-the-in 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
    margin-bottom: 2px;
  }
  .lnd-cards-wrap {
    display: flex; perspective: 600px;
    animation: lnd-glow 3s ease 1.2s infinite;
  }
  .lnd-letter {
    font-size: clamp(48px,12vw,72px);
    font-weight: 800; color: #fff;
    letter-spacing: -1px;
    display: inline-block;
    animation: lnd-letter 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .lnd-suit {
    font-size: clamp(48px,12vw,72px);
    animation: lnd-letter 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
    display: inline-block;
  }

  /* Tagline */
  @keyframes lnd-fade-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .lnd-tagline {
    color: rgba(255,255,255,0.35);
    font-size: 13px; letter-spacing: 0.05em;
    animation: lnd-fade-up 0.5s ease 1.4s both;
  }

  /* Greeting */
  .lnd-greeting {
    animation: lnd-fade-up 0.4s ease 1.5s both;
    background: rgba(245,158,11,0.12);
    border: 1px solid rgba(245,158,11,0.25);
    border-radius: 999px; padding: 6px 18px;
    color: #f59e0b; font-size: 13px; font-weight: 500;
    display: inline-flex; align-items: center; gap: 6px;
  }

  /* Buttons */
  @keyframes lnd-btn-in {
    from { opacity:0; transform:translateY(24px) scale(0.95); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  .lnd-btn-wrap { width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 10px; }

  .lnd-btn {
    width: 100%; padding: 16px 20px;
    border-radius: 14px; border: none;
    font-family: inherit; font-size: 16px; font-weight: 600;
    cursor: pointer; position: relative; overflow: hidden;
    transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s ease;
    letter-spacing: 0.01em;
  }
  .lnd-btn::before {
    content: ''; position: absolute; inset: 0;
    background: rgba(255,255,255,0); transition: background 0.2s;
  }
  .lnd-btn:hover { transform: translateY(-2px); }
  .lnd-btn:hover::before { background: rgba(255,255,255,0.08); }
  .lnd-btn:active { transform: scale(0.97); }

  .lnd-btn-primary {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: #1a0f00;
    box-shadow: 0 8px 24px rgba(245,158,11,0.35), 0 2px 8px rgba(0,0,0,0.3);
    animation: lnd-btn-in 0.45s cubic-bezier(0.34,1.56,0.64,1) 1.6s both;
  }
  .lnd-btn-primary:hover { box-shadow: 0 12px 32px rgba(245,158,11,0.5), 0 4px 12px rgba(0,0,0,0.3); }

  .lnd-btn-secondary {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12) !important;
    color: rgba(255,255,255,0.8);
    animation: lnd-btn-in 0.45s cubic-bezier(0.34,1.56,0.64,1) 1.75s both;
  }
  .lnd-btn-secondary:hover { border-color: rgba(255,255,255,0.25) !important; }

  /* Join input area */
  @keyframes lnd-panel-in {
    from { opacity:0; transform:translateY(20px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  .lnd-join-panel {
    width: 100%; max-width: 360px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 18px; padding: 1.5rem;
    animation: lnd-panel-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .lnd-code-input {
    width: 100%; background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 10px; padding: 14px 16px;
    color: #fff; font-size: 24px; font-family: inherit;
    letter-spacing: 0.3em; text-align: center; text-transform: uppercase;
    outline: none; box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
    margin-bottom: 10px;
  }
  .lnd-code-input:focus {
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245,158,11,0.2);
  }
  .lnd-code-input::placeholder { color: rgba(255,255,255,0.2); letter-spacing: 0.3em; }
  
  .lnd-change-name {
    background: none; border: none;
    color: rgba(255,255,255,0.25); font-size: 12px;
    cursor: pointer; font-family: inherit; margin-top: 4px;
    text-decoration: underline; text-underline-offset: 3px;
  }
  .lnd-change-name:hover { color: rgba(255,255,255,0.5); }
`

export default function LandingScreen({ playerName, onChangeName, onCreateRoom, onJoinRoom, creating, joining }) {
  const [mode, setMode]       = useState('home')   // 'home' | 'join'
  const [code, setCode]       = useState('')
  const [logoReady, setLogoReady] = useState(false)

  useEffect(() => { setTimeout(() => setLogoReady(true), 100) }, [])

  const joinUrl = window.location.origin + '?join=' + code

  return (
    <>
      <style>{CSS}</style>
      <div className="lnd-root">

        {/* Background floating cards */}
        {BG_CARDS.map((c, i) => {
          const red = RED.has(c.suit)
          const x2 = c.x + (Math.random() > 0.5 ? 8 : -8)
          const y2 = c.y + (Math.random() > 0.5 ? 10 : -10)
          return (
            <div key={i} className="lnd-bg-card" style={{
              left: `${c.x}%`, top: `${c.y}%`,
              width: c.size, height: c.size * 1.42,
              '--dur': c.dur, '--delay': c.delay,
              '--tf0': `translate(0,0) rotate(${c.rot}deg)`,
              '--tf1': `translate(${x2 - c.x}px,${y2 - c.y}px) rotate(${c.rot + (i%2===0?8:-8)}deg)`,
              '--tf2': `translate(${(x2-c.x)*1.5}px,${(y2-c.y)*1.5}px) rotate(${c.rot-(i%2===0?4:-4)}deg)`,
              '--op0': 0.07, '--op1': 0.14,
            }}>
              <span style={{ fontSize: c.size*0.22, fontWeight:700, color: red?'#dc2626':'#111', lineHeight:1 }}>{c.val}</span>
              <span style={{ fontSize: c.size*0.35, color: red?'#dc2626':'#111', lineHeight:1 }}>{c.suit}</span>
            </div>
          )
        })}

        {/* Logo */}
        {mode === 'home' && (
          <div style={{ textAlign:'center', marginBottom:'2rem', position:'relative', zIndex:1 }}>
            <div className="lnd-the">The</div>
            <div className="lnd-cards-wrap">
              {'CARDS'.split('').map((l, i) => (
                <span key={i} className="lnd-letter" style={{ animationDelay:`${0.4 + i*0.08}s` }}>{l}</span>
              ))}
            </div>
            <p className="lnd-tagline" style={{ marginTop:8 }}>Trinkspiele für alle</p>
          </div>
        )}

        {/* Greeting */}
        {mode === 'home' && playerName && (
          <div style={{ marginBottom:'1.5rem', zIndex:1 }}>
            <div className="lnd-greeting">👋 Hey, {playerName}!</div>
          </div>
        )}

        {/* Buttons / Join panel */}
        <div style={{ position:'relative', zIndex:1, width:'100%', display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>
          {mode === 'home' ? (
            <div className="lnd-btn-wrap">
              <button className="lnd-btn lnd-btn-primary" onClick={onCreateRoom} disabled={creating}>
                {creating ? '⏳ Erstelle Raum…' : '+ Neues Spiel erstellen'}
              </button>
              <button className="lnd-btn lnd-btn-secondary" style={{ border:'1px solid' }} onClick={() => setMode('join')}>
                Raum beitreten →
              </button>
              {playerName && (
                <div style={{ textAlign:'center', marginTop:4 }}>
                  <button className="lnd-change-name" onClick={onChangeName}>Name ändern</button>
                </div>
              )}
            </div>
          ) : (
            <div className="lnd-join-panel">
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.25rem' }}>
                <button onClick={() => { setMode('home'); setCode('') }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:20, padding:0, lineHeight:1 }}>←</button>
                <p style={{ margin:0, fontWeight:600, fontSize:17 }}>Raum beitreten</p>
              </div>
              <input
                className="lnd-code-input"
                type="text" autoFocus
                placeholder="XXXXX"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,''))}
                onKeyDown={e => e.key==='Enter' && code.length>=4 && onJoinRoom(code)}
                maxLength={5}
              />
              <button
                className="lnd-btn lnd-btn-primary"
                onClick={() => code.length>=4 && onJoinRoom(code)}
                disabled={code.length<4 || joining}
                style={{ opacity: code.length<4 ? 0.4 : 1 }}
              >
                {joining ? 'Suche Raum…' : 'Beitreten'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
