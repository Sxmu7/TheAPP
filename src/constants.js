export const PLAYER_COLORS = [
  { fill: '#EEEDFE', stroke: '#7F77DD', text: '#3C3489' },
  { fill: '#E1F5EE', stroke: '#1D9E75', text: '#085041' },
  { fill: '#FAECE7', stroke: '#D85A30', text: '#712B13' },
  { fill: '#FBEAF0', stroke: '#D4537E', text: '#72243E' },
  { fill: '#EAF3DE', stroke: '#639922', text: '#27500A' },
  { fill: '#E6F1FB', stroke: '#378ADD', text: '#0C447C' },
  { fill: '#FAEEDA', stroke: '#BA7517', text: '#633806' },
  { fill: '#FCEBEB', stroke: '#E24B4A', text: '#791F1F' },
]

export const GAMES = [
  {
    id:    'g1',
    emoji: '🃏',
    name:  'Arschloch',
    desc:  '3–6 Spieler · Karten · Klassiker',
    ready: true,
    type:  'arschloch',
  },
  { id:'g2', emoji:'🎲', name:'Spiel 2', desc:'Kommt bald', ready:false, type:'placeholder' },
  { id:'g3', emoji:'🤔', name:'Spiel 3', desc:'Kommt bald', ready:false, type:'placeholder' },
  { id:'g4', emoji:'⚡', name:'Spiel 4', desc:'Kommt bald', ready:false, type:'placeholder' },
  { id:'g5', emoji:'🏆', name:'Spiel 5', desc:'Kommt bald', ready:false, type:'placeholder' },
  { id:'g6', emoji:'🎯', name:'Spiel 6', desc:'Kommt bald', ready:false, type:'placeholder' },
]

export const genCode = () =>
  Math.random().toString(36).slice(2, 7).toUpperCase()
