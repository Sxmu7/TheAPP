import { useState, useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// CSS — injected once, scoped to .gm-* classes
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
  .gm-root {
    background: #0b1520;
    min-height: 100dvh;
    color: #e2e8f0;
    font-family: inherit;
    overflow-x: hidden;
  }
  .gm-card {
    position: relative;
    border-radius: 9px;
    background: #ffffff;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 3px 10px rgba(0,0,0,0.6), inset 0 0 0 0.5px rgba(0,0,0,0.08);
    transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
    flex-shrink: 0;
  }
  .gm-card.clickable { cursor: pointer; }
  .gm-card.clickable:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 22px rgba(0,0,0,0.65), inset 0 0 0 0.5px rgba(0,0,0,0.08);
  }
  .gm-card.sel {
    transform: translateY(-18px) scale(1.07) !important;
    box-shadow: 0 20px 36px rgba(245,158,11,0.6), 0 0 0 2.5px #f59e0b !important;
    z-index: 10;
  }
  .gm-card.back {
    background: linear-gradient(145deg, #1e40af 0%, #0d1f6e 100%);
    border: 1.5px solid rgba(100,130,220,0.25);
    cursor: default;
  }
  .gm-card.back:hover { transform: none !important; box-shadow: 0 3px 10px rgba(0,0,0,0.6) !important; }
  .gm-pip-tl { position:absolute; top:4px; left:5px; line-height:1.1; }
  .gm-pip-br { position:absolute; bottom:4px; right:5px; line-height:1.1; transform:rotate(180deg); }
  .gm-suit-c { line-height:1; }

  @keyframes gm-deal {
    0%   { transform:translateY(-200px) translateX(20px) scale(0.3) rotate(-16deg); opacity:0; }
    62%  { transform:translateY(6px) scale(1.07) rotate(0.5deg); opacity:1; }
    100% { transform:translateY(0) scale(1) rotate(0); opacity:1; }
  }
  .gm-deal { animation: gm-deal 0.44s cubic-bezier(0.34,1.56,0.64,1) both; }

  @keyframes gm-pile-in {
    0%   { transform:translateY(-40px) scale(0.6) rotate(-8deg); opacity:0; }
    62%  { transform:translateY(4px) scale(1.08) rotate(1deg); opacity:1; }
    100% { transform:translateY(0) scale(1) rotate(0); opacity:1; }
  }
  .gm-pile-in { animation: gm-pile-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }

  @keyframes gm-pile-clear {
    0%   { transform:scale(1) translateX(0) rotate(0); opacity:1; }
    100% { transform:scale(0.35) translateX(160px) rotate(18deg); opacity:0; }
  }
  .gm-pile-clear { animation: gm-pile-clear 0.4s cubic-bezier(0.4,0,1,1) both; }

  @keyframes gm-slide-up {
    from { transform:translateY(24px); opacity:0; }
    to   { transform:translateY(0); opacity:1; }
  }
  .gm-slide-up { animation: gm-slide-up 0.3s ease both; }

  @keyframes gm-bounce-in {
    0%   { transform:scale(0.4) rotate(-10deg); opacity:0; }
    55%  { transform:scale(1.12) rotate(1deg);  opacity:1; }
    75%  { transform:scale(0.96); }
    100% { transform:scale(1) rotate(0); opacity:1; }
  }
  .gm-bounce-in { animation: gm-bounce-in 0.52s cubic-bezier(0.34,1.56,0.64,1) both; }

  @keyframes gm-pulse-gold {
    0%,100% { box-shadow: 0 0 0 0   rgba(245,158,11,0.55); }
    50%      { box-shadow: 0 0 0 10px rgba(245,158,11,0);   }
  }
  .gm-pulse { animation: gm-pulse-gold 1.9s ease infinite; }

  @keyframes gm-revolution {
    0%,100% { background: rgba(245,158,11,0.0); }
    30%,70% { background: rgba(245,158,11,0.14); }
  }
  .gm-rev-flash { animation: gm-revolution 0.75s ease 3; }

  @keyframes gm-float {
    0%,100% { transform:translateY(0)   rotate(0); }
    33%      { transform:translateY(-8px) rotate(2deg); }
    66%      { transform:translateY(-4px) rotate(-1deg); }
  }
  .gm-float { animation: gm-float 3.2s ease infinite; }

  @keyframes gm-confetti {
    0%   { transform:translateY(-10px) rotate(0deg) scale(0);   opacity:0; }
    20%  { opacity:1; }
    100% { transform:translateY(80px)  rotate(400deg) scale(1); opacity:0; }
  }

  .gm-glass {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
  }
  .gm-hand {
    display:flex; gap:7px; flex-wrap:wrap;
    justify-content:center; padding:8px 12px 20px;
    min-height:90px; align-items:flex-end;
  }
  .gm-action-bar { display:flex; gap:10px; padding:10px 16px 22px; }
  .gm-btn {
    border:none; border-radius:12px;
    font-family:inherit; font-size:14px; font-weight:500;
    cursor:pointer; padding:14px 18px;
    transition: transform 0.1s, background 0.12s;
  }
  .gm-btn:active:not(:disabled) { transform:scale(0.97); }
  .gm-btn-gold  { background:#f59e0b; color:#1a0f00; }
  .gm-btn-gold:hover:not(:disabled)  { background:#fbbf24; }
  .gm-btn-gold:disabled { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.2); cursor:not-allowed; }
  .gm-btn-ghost { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.6); }
  .gm-btn-ghost:hover { background:rgba(255,255,255,0.12); }
  .gm-tag { display:inline-flex; align-items:center; padding:3px 11px; border-radius:999px; font-size:11px; font-weight:500; }
`

// ─────────────────────────────────────────────────────────────────────────────
// Logic — korrigierte Arschloch-Regeln
// ─────────────────────────────────────────────────────────────────────────────
const SUITS = ['♠','♥','♦','♣']
const RED   = new Set(['♥','♦'])
const VL    = {11:'J',12:'Q',13:'K',14:'A'}
const ROLE_META = {
  president:        { label:'Präsident',    emoji:'👑', bg:'rgba(245,158,11,0.14)', br:'rgba(245,158,11,0.4)',  col:'#f59e0b' },
  vize:             { label:'Vize',         emoji:'🥈', bg:'rgba(148,163,184,0.1)', br:'rgba(148,163,184,0.3)', col:'#94a3b8' },
  buerger:          { label:'Bürger',       emoji:'👤', bg:'rgba(100,116,139,0.08)',br:'rgba(100,116,139,0.2)', col:'#64748b' },
  'vize-arschloch': { label:'Vize-A.',      emoji:'🥴', bg:'rgba(251,146,60,0.1)', br:'rgba(251,146,60,0.3)',  col:'#fb923c' },
  arschloch:        { label:'Arschloch',    emoji:'💩', bg:'rgba(239,68,68,0.12)', br:'rgba(239,68,68,0.35)',  col:'#ef4444' },
}

const cardPower = (card) => card?.value ?? 0
const comparePower = (a, b, revolution = false) => revolution ? cardPower(a) - cardPower(b) : cardPower(b) - cardPower(a)

function mkCard(s,v){ return {id:`${s}${v}`,suit:s,value:v,label:VL[v]||String(v)} }
function createDeck(){ return SUITS.flatMap(s=>[2,3,4,5,6,7,8,9,10,11,12,13,14].map(v=>mkCard(s,v))) }
function shuffle(a){ const r=[...a]; for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]]} return r }
function sortHand(cards, revolution = false){ return [...cards].sort((a,b)=>comparePower(a,b,revolution)) }
function deal(ids){ const d=shuffle(createDeck()),h=Object.fromEntries(ids.map(id=>[id,[]])); d.forEach((c,i)=>h[ids[i%ids.length]].push(c)); ids.forEach(id=>h[id]=sortHand(h[id])); return h }

// Gültig ist nur: gleiche Werte, gleiche Anzahl wie der Stapel, und höher als der Stapel.
// 2 räumt immer den Tisch. Bei Revolution ist die Wertung umgedreht, 2 bleibt trotzdem Räumkarte.
function canPlay(sel, top, cnt, rev){
  if(!sel.length) return false
  const value = sel[0].value
  if(!sel.every(c=>c.value===value)) return false
  if(cnt > 0 && sel.length !== cnt) return false
  if(top === null) return true
  if(value === 2) return true
  if(top === 2) return false
  return rev ? value < top : value > top
}

function nextActiveAfter(cur, active, playerOrder){
  if(!active.length) return null
  const order = playerOrder.filter(id=>active.includes(id))
  if(!order.length) return active[0]
  const idx = order.indexOf(cur)
  if(idx === -1) return order[0]
  return order[(idx + 1) % order.length]
}

function nextTurn(cur, passed, active, playerOrder){
  const available = active.filter(id=>!passed.includes(id))
  return nextActiveAfter(cur, available.length ? available : active, playerOrder)
}

function roles(fin, all){
  const finishOrder = [...fin]
  all.forEach(id=>{ if(!finishOrder.includes(id)) finishOrder.push(id) })
  const n=all.length,r={}
  finishOrder.forEach((id,i)=>{
    if(i===0) r[id]='president'
    else if(i===1 && n>=4) r[id]='vize'
    else if(i===n-2 && n>=4) r[id]='vize-arschloch'
    else if(i===n-1) r[id]='arschloch'
    else r[id]='buerger'
  })
  return r
}

function lowestStartPlayer(playerIds, hands){
  // Klassisch beginnt die niedrigste Karte, bevorzugt 3♣ falls vorhanden.
  const threeClubsOwner = playerIds.find(id => hands[id]?.some(c => c.suit === '♣' && c.value === 3))
  if(threeClubsOwner) return threeClubsOwner
  let startId = playerIds[0], best = 99
  playerIds.forEach(id=>{
    const lowest = [...(hands[id] || [])].sort((a,b)=>a.value-b.value)[0]?.value ?? 99
    if(lowest < best){ best = lowest; startId = id }
  })
  return startId
}

function moveBestCards(fromId, toId, hands, amount){
  if(!fromId || !toId || !hands[fromId] || !hands[toId]) return hands
  const give = [...hands[fromId]].sort((a,b)=>b.value-a.value).slice(0,amount)
  const giveIds = new Set(give.map(c=>c.id))
  return {
    ...hands,
    [fromId]: hands[fromId].filter(c=>!giveIds.has(c.id)),
    [toId]: sortHand([...hands[toId], ...give]),
  }
}

function initRound(playerIds, prevRoles, roundNumber) {
  let h = deal(playerIds)
  if (roundNumber > 1 && prevRoles) {
    const pres=playerIds.find(id=>prevRoles[id]==='president'), ars=playerIds.find(id=>prevRoles[id]==='arschloch')
    const viz=playerIds.find(id=>prevRoles[id]==='vize'),        va=playerIds.find(id=>prevRoles[id]==='vize-arschloch')
    // Pflichtabgabe: Arschloch gibt die 2 besten Karten, Vize-Arschloch die beste Karte.
    h = moveBestCards(ars, pres, h, 2)
    h = moveBestCards(va, viz, h, 1)
    const ex={presId:pres,arsId:ars,vizeId:viz,vizeArsId:va,step:pres&&ars?'president':viz&&va?'vize':'done'}
    const startId=ars || lowestStartPlayer(playerIds, h)
    return {phase:ex.step!=='done'?'exchange':'tricks',roundNumber,hands:h,pile:[],pileCount:0,pileTopValue:null,lastPlayedBy:null,currentId:startId,passedIds:[],activeIds:[...playerIds],playerOrder:[...playerIds],finishedIds:[],roles:prevRoles,revolution:false,exchange:ex}
  }
  const s=lowestStartPlayer(playerIds, h)
  return {phase:'tricks',roundNumber:1,hands:h,pile:[],pileCount:0,pileTopValue:null,lastPlayedBy:null,currentId:s,passedIds:[],activeIds:[...playerIds],playerOrder:[...playerIds],finishedIds:[],roles:{},revolution:false,exchange:null}
}

// ─────────────────────────────────────────────────────────────────────────────
// Card component
// ─────────────────────────────────────────────────────────────────────────────
function PCard({card,selected,onClick,back,size='md',dealDelay=null,pileAnim=false,clearAnim=false}) {
  const S={sm:{w:30,h:44,pip:8,suit:13},md:{w:46,h:66,pip:10,suit:20},lg:{w:60,h:85,pip:13,suit:28}}[size]||{w:46,h:66,pip:10,suit:20}
  const cls=['gm-card',onClick&&'clickable',selected&&'sel',back&&'back',dealDelay!==null&&'gm-deal',pileAnim&&'gm-pile-in',clearAnim&&'gm-pile-clear'].filter(Boolean).join(' ')
  const style={width:S.w,height:S.h,...(dealDelay!==null?{animationDelay:`${dealDelay}ms`}:{})}
  if(back) return <div className={cls} style={style}><div style={{width:'50%',height:'50%',borderRadius:3,border:'1.5px solid rgba(140,170,255,0.2)'}}/></div>
  const c=RED.has(card.suit)?'#dc2626':'#111827'
  return (
    <div className={cls} onClick={onClick} style={style}>
      <div className="gm-pip-tl" style={{fontSize:S.pip,fontWeight:700,color:c}}><div>{card.label}</div><div style={{fontSize:S.pip-2}}>{card.suit}</div></div>
      <div className="gm-suit-c" style={{fontSize:S.suit,color:c}}>{card.suit}</div>
      <div className="gm-pip-br" style={{fontSize:S.pip,fontWeight:700,color:c}}><div>{card.label}</div><div style={{fontSize:S.pip-2}}>{card.suit}</div></div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Confetti
// ─────────────────────────────────────────────────────────────────────────────
function Confetti() {
  const ps=[...Array(20)].map((_,i)=>({x:10+Math.random()*80,d:i*60,col:['#f59e0b','#534AB7','#1D9E75','#ef4444','#e2e8f0'][i%5],s:5+Math.random()*7,dur:800+Math.random()*700}))
  return <div style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',overflow:'hidden'}}>{ps.map((p,i)=><div key={i} style={{position:'absolute',top:'-5%',left:`${p.x}%`,width:p.s,height:p.s,background:p.col,borderRadius:p.s>9?'50%':2,animation:`gm-confetti ${p.dur}ms ease ${p.d}ms both`}}/>)}</div>
}

// ─────────────────────────────────────────────────────────────────────────────
// Exchange
// ─────────────────────────────────────────────────────────────────────────────
function ExchangePhase({gs,players,onUpdate}) {
  const [sel,setSel]=useState([])
  const ex=gs.exchange, actId=ex.step==='president'?ex.presId:ex.vizeId, recId=ex.step==='president'?ex.arsId:ex.vizeArsId
  const need=ex.step==='president'?2:1, actor=players.find(p=>p.id===actId), hand=gs.hands[actId]||[]
  const toggle=c=>setSel(p=>p.find(x=>x.id===c.id)?p.filter(x=>x.id!==c.id):p.length<need?[...p,c]:p)
  const confirm=()=>{
    if(sel.length!==need)return
    const h={...gs.hands}; sel.forEach(c=>{h[actId]=h[actId].filter(x=>x.id!==c.id);h[recId]=sortHand([...h[recId],c], gs.revolution)})
    const next=ex.step==='president'&&ex.vizeId&&ex.vizeArsId?'vize':'done'
    onUpdate({...gs,hands:h,exchange:{...ex,step:next},phase:next==='done'?'tricks':'exchange'}); setSel([])
  }
  return (
    <div className="gm-root" style={{padding:'1.5rem 1.25rem',maxWidth:480,margin:'0 auto'}}>
      <div className="gm-glass gm-slide-up" style={{padding:'1.5rem',textAlign:'center',marginBottom:'1.5rem'}}>
        <div style={{fontSize:36,marginBottom:10}}>🔄</div>
        <p style={{margin:'0 0 4px',fontSize:11,fontWeight:500,letterSpacing:'0.1em',color:'#f59e0b'}}>KARTENTAUSCH — RUNDE {gs.roundNumber}</p>
        <p style={{margin:0,fontSize:16,fontWeight:500}}>{actor?.name}, wähle {need} {need===1?'Karte':'Karten'} zurückzugeben</p>
        <p style={{margin:'8px 0 0',fontSize:12,color:'rgba(255,255,255,0.35)'}}>{need===2?'Präsident gibt 2 Karten ans Arschloch':'Vize-Präsident gibt 1 Karte an Vize-Arschloch'}</p>
      </div>
      <div className="gm-hand" style={{marginBottom:'1.5rem'}}>{hand.map((c,i)=><PCard key={c.id} card={c} selected={!!sel.find(x=>x.id===c.id)} onClick={()=>toggle(c)} dealDelay={i*40} />)}</div>
      <button onClick={confirm} disabled={sel.length!==need} className="gm-btn gm-btn-gold" style={{width:'100%',fontSize:15}}>{sel.length}/{need} gewählt — Bestätigen ✓</button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Round End
// ─────────────────────────────────────────────────────────────────────────────
function RoundEnd({gs,players,onNewRound}) {
  const allIds=gs.playerOrder || players.map(p=>p.id)
  const rm=roles(gs.finishedIds,allIds), arsId=Object.entries(rm).find(([,r])=>r==='arschloch')?.[0]
  const arsPly=players.find(p=>p.id===arsId)
  const ord=[...players].sort((a,b)=>{const k=Object.keys(ROLE_META);return k.indexOf(rm[a.id]||'buerger')-k.indexOf(rm[b.id]||'buerger')})
  return (
    <div className="gm-root" style={{padding:'1.5rem 1.25rem',maxWidth:480,margin:'0 auto',position:'relative'}}>
      <Confetti/>
      <div style={{textAlign:'center',marginBottom:'1.5rem',position:'relative'}}>
        <div className="gm-bounce-in" style={{fontSize:60,display:'inline-block',marginBottom:10}}>🏆</div>
        <h2 className="gm-slide-up" style={{fontSize:24,fontWeight:600,margin:'0 0 4px',letterSpacing:'-0.3px'}}>Runde {gs.roundNumber} beendet!</h2>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:'1.5rem'}}>
        {ord.map((p,i)=>{const meta=ROLE_META[rm[p.id]]||ROLE_META.buerger; return (
          <div key={p.id} className="gm-slide-up" style={{display:'flex',alignItems:'center',gap:12,padding:'13px 16px',borderRadius:14,background:meta.bg,border:`1px solid ${meta.br}`,animationDelay:`${i*65}ms`}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:p.color.fill,border:`2px solid ${p.color.stroke}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,color:p.color.text,flexShrink:0}}>{p.name.slice(0,2).toUpperCase()}</div>
            <span style={{flex:1,fontWeight:500}}>{p.name}</span>
            <span style={{fontSize:13,color:meta.col,fontWeight:500}}>{meta.emoji} {meta.label}</span>
          </div>
        )})}
      </div>
      {arsPly&&<div className="gm-bounce-in" style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:14,padding:'1rem',marginBottom:'1.5rem',textAlign:'center',animationDelay:'400ms'}}><p style={{margin:0,fontSize:15,fontWeight:500,color:'#fca5a5'}}>💩 {arsPly.name} ist das Arschloch —&nbsp;trinkt <strong>{players.length}×</strong> 🍺</p></div>}
      <button onClick={onNewRound} className="gm-btn gm-btn-gold" style={{width:'100%',fontSize:15}}>Nächste Runde →</button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tricks
// ─────────────────────────────────────────────────────────────────────────────
function TricksPhase({gs,players,onUpdate}) {
  const [sel,setSel]=useState([])
  const [pileKey,setPileKey]=useState(0)
  const [clearing,setClearing]=useState(false)
  const prevPile=useRef(gs.pile)
  useEffect(()=>{ if(gs.pile.length>prevPile.current.length)setPileKey(k=>k+1); prevPile.current=gs.pile },[gs.pile])

  const cur=players.find(p=>p.id===gs.currentId), hand=gs.hands[gs.currentId]||[], valid=canPlay(sel,gs.pileTopValue,gs.pileCount,gs.revolution)
  const toggle=c=>setSel(p=>p.find(x=>x.id===c.id)?p.filter(x=>x.id!==c.id):[...p,c])

  const doPlay=()=>{
    if(!valid)return
    const order = gs.playerOrder || players.map(p=>p.id)
    const playedValue = sel[0].value
    const isFour = sel.length===4 && sel.every(c=>c.value===playedValue)
    const clearsTable = playedValue === 2 || isFour
    const newRev = isFour ? !gs.revolution : gs.revolution
    const h={...gs.hands}; h[gs.currentId]=hand.filter(c=>!sel.find(s=>s.id===c.id))

    let fin=[...gs.finishedIds], act=[...gs.activeIds]
    if(h[gs.currentId].length===0){
      fin=[...fin,gs.currentId]
      act=act.filter(id=>id!==gs.currentId)
    }

    if(act.length<=1){
      const finalFin = act.length===1 && !fin.includes(act[0]) ? [...fin, act[0]] : fin
      onUpdate({...gs,hands:h,finishedIds:finalFin,activeIds:act,phase:'round-end',revolution:newRev,pile:[],pileCount:0,pileTopValue:null,passedIds:[]})
      setSel([])
      return
    }

    const pile = clearsTable ? [] : sel
    const cnt = clearsTable ? 0 : sel.length
    const top = clearsTable ? null : playedValue
    const passed=[]
    const nxt = clearsTable || h[gs.currentId].length===0
      ? nextActiveAfter(gs.currentId, act, order)
      : nextTurn(gs.currentId, passed, act, order)

    onUpdate({...gs,hands:h,pile,pileCount:cnt,pileTopValue:top,lastPlayedBy:clearsTable?null:gs.currentId,currentId:nxt,passedIds:passed,finishedIds:fin,activeIds:act,revolution:newRev})
    setSel([])
  }

  const doPass=()=>{
    // Auf leerem Tisch darf man nicht passen – man muss eröffnen.
    if(gs.pileCount === 0) return
    const order = gs.playerOrder || players.map(p=>p.id)
    const passed=[...new Set([...gs.passedIds,gs.currentId])]
    const stillCanAnswer=gs.activeIds.filter(id=>!passed.includes(id))

    // Sobald nur noch der letzte Ausspieler übrig ist, ist der Stich vorbei.
    // Falls der letzte Ausspieler bereits alle Karten los ist, wird ebenfalls direkt geleert.
    const trickIsOver = stillCanAnswer.length === 0 || (stillCanAnswer.length === 1 && stillCanAnswer[0] === gs.lastPlayedBy)
    if(trickIsOver){
      const starter = gs.activeIds.includes(gs.lastPlayedBy) ? gs.lastPlayedBy : nextActiveAfter(gs.lastPlayedBy || gs.currentId, gs.activeIds, order)
      setClearing(true)
      setTimeout(()=>{setClearing(false);onUpdate({...gs,pile:[],pileCount:0,pileTopValue:null,lastPlayedBy:null,currentId:starter,passedIds:[]})},420)
    } else {
      onUpdate({...gs,passedIds:passed,currentId:nextTurn(gs.currentId,passed,gs.activeIds,order)})
    }
    setSel([])
  }

  const others=players.filter(p=>p.id!==gs.currentId&&gs.activeIds.includes(p.id))

  return (
    <div className="gm-root" style={{display:'flex',flexDirection:'column',minHeight:'100dvh'}}>

      {/* Top bar */}
      <div style={{padding:'0.75rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <span style={{fontSize:13,color:'rgba(255,255,255,0.3)',fontWeight:500}}>Runde {gs.roundNumber}</span>
        {gs.revolution
          ? <span className="gm-tag gm-rev-flash" style={{background:'rgba(245,158,11,0.14)',border:'1px solid rgba(245,158,11,0.4)',color:'#f59e0b',gap:5}}>⚡ Revolution!</span>
          : <span className="gm-tag" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.28)'}}>Normal</span>}
        <span style={{fontSize:12,color:'rgba(255,255,255,0.28)'}}>{gs.activeIds.length} aktiv</span>
      </div>

      {/* Other players */}
      <div style={{padding:'0.75rem 1.25rem 0.5rem',display:'flex',gap:20,flexWrap:'wrap',minHeight:70,alignItems:'flex-start'}}>
        {others.map(p=>{
          const ph=gs.hands[p.id]||[], passed=gs.passedIds.includes(p.id)
          return (
            <div key={p.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,opacity:passed?0.28:1,transition:'opacity 0.3s'}}>
              <div style={{display:'flex',alignItems:'flex-end'}}>
                {Array.from({length:Math.min(ph.length,9)}).map((_,i)=>(
                  <div key={i} style={{marginLeft:i>0?-10:0,zIndex:i}}><PCard back size="sm"/></div>
                ))}
                {ph.length>9&&<span style={{fontSize:9,color:'rgba(255,255,255,0.35)',marginLeft:4,alignSelf:'center'}}>+{ph.length-9}</span>}
              </div>
              <span style={{fontSize:11,color:'rgba(255,255,255,0.4)',whiteSpace:'nowrap'}}>{p.name} ({ph.length}){passed?' · passt':''}</span>
            </div>
          )
        })}
        {others.length===0&&<span style={{fontSize:13,color:'rgba(255,255,255,0.2)'}}>Alle anderen fertig</span>}
      </div>

      {/* Pile */}
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0.5rem 1.25rem',gap:10,minHeight:120}}>
        <div key={pileKey} style={{display:'flex',gap:8,alignItems:'center',justifyContent:'center',minHeight:96}}>
          {gs.pile.length===0?(
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:36,opacity:0.15,marginBottom:6}}>🃏</div>
              <span style={{fontSize:13,color:'rgba(255,255,255,0.2)'}}>Neuer Stich — beliebig öffnen</span>
            </div>
          ):(
            gs.pile.map((c,i)=><PCard key={`${pileKey}-${c.id}`} card={c} size="lg" pileAnim={!clearing} clearAnim={clearing} />)
          )}
        </div>
        {gs.pile.length>0&&gs.lastPlayedBy&&(
          <span style={{fontSize:12,color:'rgba(255,255,255,0.28)'}}>gespielt von {players.find(p=>p.id===gs.lastPlayedBy)?.name}</span>
        )}
      </div>

      {/* Player dots */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'0.25rem 1.25rem'}}>
        {players.filter(p=>gs.activeIds.includes(p.id)).map(p=>{
          const active=p.id===gs.currentId
          return (
            <div key={p.id} title={p.name} className={active?'gm-pulse':''} style={{
              width:active?44:33,height:active?44:33,borderRadius:'50%',
              background:active?p.color.fill:'rgba(255,255,255,0.06)',
              border:active?`2.5px solid ${p.color.stroke}`:'1px solid rgba(255,255,255,0.1)',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:active?12:10,fontWeight:600,
              color:active?p.color.text:'rgba(255,255,255,0.28)',
              transition:'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
            }}>{p.name.slice(0,2).toUpperCase()}</div>
          )
        })}
      </div>
      <div style={{textAlign:'center',padding:'0.4rem 0 0.2rem'}}>
        {cur&&<span style={{fontSize:13,fontWeight:500,color:cur.color.text,background:cur.color.fill,padding:'4px 16px',borderRadius:999,border:`1px solid ${cur.color.stroke}`,display:'inline-block'}}>{cur.name} ist dran</span>}
      </div>

      {/* Hand */}
      <div className="gm-hand">
        {hand.map(c=><PCard key={c.id} card={c} selected={!!sel.find(x=>x.id===c.id)} onClick={()=>toggle(c)} />)}
        {!hand.length&&<span style={{fontSize:13,color:'rgba(255,255,255,0.28)',alignSelf:'center'}}>Keine Karten mehr</span>}
      </div>

      {/* Actions */}
      <div className="gm-action-bar">
        <button onClick={doPass} disabled={gs.pileCount===0} className="gm-btn gm-btn-ghost" style={{flex:1}}>Passen</button>
        <button onClick={doPlay} disabled={!valid} className="gm-btn gm-btn-gold" style={{flex:2}}>
          {sel.length?`${sel.length}× ${sel[0]?.label}${sel[0]?.suit} spielen`:'Karte auswählen'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────────────────────────────────────
function StartScreen({players,onStart}) {
  return (
    <div className="gm-root" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100dvh',padding:'2rem',textAlign:'center',gap:20}}>
      <div className="gm-float"><div style={{fontSize:76,lineHeight:1}}>🃏</div></div>
      <div className="gm-slide-up" style={{animationDelay:'80ms'}}>
        <h2 style={{fontSize:30,fontWeight:600,margin:'0 0 6px',letterSpacing:'-0.5px'}}>Arschloch</h2>
        <p style={{margin:0,fontSize:14,color:'rgba(255,255,255,0.38)'}}>{players.length} Spieler · {Math.floor(52/players.length)} Karten pro Person</p>
      </div>
      <div className="gm-slide-up" style={{animationDelay:'150ms',display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',maxWidth:320}}>
        {players.map(p=><span key={p.id} style={{padding:'5px 13px',borderRadius:999,background:p.color.fill,border:`1px solid ${p.color.stroke}`,fontSize:12,fontWeight:500,color:p.color.text}}>{p.name}</span>)}
      </div>
      <button onClick={onStart} className="gm-btn gm-btn-gold gm-bounce-in" style={{fontSize:16,padding:'16px 44px',animationDelay:'220ms'}}>Karten austeilen</button>
      <p className="gm-slide-up" style={{animationDelay:'300ms',fontSize:11,color:'rgba(255,255,255,0.18)',margin:0}}>Ziel: Als Erster alle Karten ablegen — Letzter ist das Arschloch</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────
export default function Arschloch({players,gameState,onUpdate}) {
  const ids=players.map(p=>p.id)
  const handleNewRound=()=>{ const allIds=gameState.playerOrder || ids; onUpdate(initRound(ids,roles(gameState.finishedIds,allIds),(gameState.roundNumber||1)+1)) }
  return (
    <>
      <style>{CSS}</style>
      {!gameState                       && <StartScreen players={players} onStart={()=>onUpdate(initRound(ids,null,1))} />}
      {gameState?.phase==='exchange'    && <ExchangePhase gs={gameState} players={players} onUpdate={onUpdate} />}
      {gameState?.phase==='round-end'   && <RoundEnd gs={gameState} players={players} onNewRound={handleNewRound} />}
      {gameState?.phase==='tricks'      && <TricksPhase gs={gameState} players={players} onUpdate={onUpdate} />}
    </>
  )
}
