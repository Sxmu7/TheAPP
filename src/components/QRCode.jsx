import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'

export function RoomQR({ roomCode }) {
  const url  = `${window.location.origin}?join=${roomCode}`
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    navigator.clipboard?.writeText(url).catch(()=>{})
    setCopied(true); setTimeout(()=>setCopied(false), 1800)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
      <div style={{
        background:'white', padding:16, borderRadius:16,
        boxShadow:'0 8px 32px rgba(0,0,0,0.15)',
      }}>
        <QRCodeSVG value={url} size={180} bgColor="#ffffff" fgColor="#0b1520" level="M" />
      </div>
      <p style={{ fontSize:11, color:'var(--text-3)', margin:0, textAlign:'center', maxWidth:220 }}>
        Scanne um direkt beizutreten
      </p>
      <button onClick={copyLink} style={{
        background:'none', border:'1px solid var(--border-2)',
        borderRadius:8, padding:'6px 14px', fontSize:12,
        color:'var(--text-2)', cursor:'pointer', fontFamily:'inherit',
        transition:'background 0.12s',
      }}>
        {copied ? '✓ Link kopiert!' : '🔗 Link kopieren'}
      </button>
    </div>
  )
}
