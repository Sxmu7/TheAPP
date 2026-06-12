# Prost! 🍺 — Multiplayer Trinkspiele App

## Schnellstart

### 1. Dependencies installieren
```bash
npm install
```

### 2. Lokal starten
```bash
npm run dev
```

### 3. Build für Produktion
```bash
npm run build
```

---

## Auf Vercel deployen

### Option A — GitHub (empfohlen)
1. Diesen Ordner als neues GitHub-Repo hochladen
2. Auf [vercel.com](https://vercel.com) einloggen
3. **"Add New Project"** → GitHub-Repo auswählen
4. Framework: **Vite** (wird automatisch erkannt)
5. **Deploy** klicken — fertig ✅

### Option B — Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## Trinkspiele hinzufügen

### 1. `src/constants.js` öffnen
Trage deine Spiele in das `GAMES`-Array ein:
```js
{
  id:    'g1',
  emoji: '🎯',
  name:  'Wahrheit oder Pflicht',
  desc:  'Klassiker für alle',
  ready: true,         // ← auf true setzen, wenn das Spiel fertig ist
  type:  'truth-or-dare',
}
```

### 2. `src/screens/InGameScreen.jsx` öffnen
Füge deinen Spielinhalt in den `switch` ein:
```jsx
switch (game?.type) {
  case 'truth-or-dare':
    return <TruthOrDareGame player={currentPlayer} />
  // weitere Spiele hier…
}
```

### 3. Eigene Spielkomponente anlegen
Erstelle z.B. `src/games/TruthOrDare.jsx` und importiere sie in `InGameScreen.jsx`.

---

## Projektstruktur

```
prost/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Avatar.jsx          ← Spieler-Avatar (Initialen + Farbe)
│   ├── screens/
│   │   ├── HomeScreen.jsx      ← Startseite (Raum erstellen / beitreten)
│   │   ├── LobbyScreen.jsx     ← Spieler hinzufügen, Raumcode teilen
│   │   ├── GameSelectScreen.jsx← Spielauswahl-Gitter
│   │   └── InGameScreen.jsx    ← Spielansicht + Drink-Counter
│   ├── App.jsx                 ← State-Machine & Screen-Router
│   ├── constants.js            ← GAMES-Array + Spielerfarben
│   ├── index.css               ← Design-System (Dark Mode inklusive)
│   └── main.jsx                ← React-Einstiegspunkt
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```
