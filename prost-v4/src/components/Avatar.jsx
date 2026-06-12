export default function Avatar({ player, size = 40 }) {
  const initials = player.name.slice(0, 2).toUpperCase()

  return (
    <div
      aria-hidden="true"
      style={{
        width:          size,
        height:         size,
        borderRadius:   '50%',
        background:     player.color.fill,
        border:         `2px solid ${player.color.stroke}`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       Math.round(size * 0.36),
        fontWeight:     500,
        color:          player.color.text,
        flexShrink:     0,
        userSelect:     'none',
      }}
    >
      {initials}
    </div>
  )
}
