# Prost! 🍺 — Setup-Anleitung

## Schritt 1 — Firebase-Projekt erstellen

1. Gehe zu **[console.firebase.google.com](https://console.firebase.google.com)**
2. Klick auf **"Projekt erstellen"**
3. Namen eingeben (z.B. `prost-app`) → Weiter → Weiter → Projekt erstellen

---

## Schritt 2 — Realtime Database aktivieren

1. Im linken Menü: **Build → Realtime Database**
2. Klick **"Datenbank erstellen"**
3. Standort wählen (z.B. `europe-west1`) → Weiter
4. **"Im Testmodus starten"** auswählen → Fertig

---

## Schritt 3 — Sicherheitsregeln einstellen

1. Öffne den **"Regeln"**-Tab in der Realtime Database
2. Ersetze den gesamten Inhalt mit dem aus `database.rules.json`:

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['status'])",
        "players": {
          "$playerId": {
            ".validate": "newData.hasChildren(['name', 'colorIdx', 'drinks'])"
          }
        }
      }
    }
  }
}
```

3. Klick **"Veröffentlichen"**

---

## Schritt 4 — Firebase-Konfiguration kopieren

1. Klick oben links auf das Zahnrad ⚙️ → **Projekteinstellungen**
2. Scrolle runter zu **"Deine Apps"**
3. Klick auf **"</>"** (Web-App hinzufügen)
4. App-Name eingeben → **"App registrieren"**
5. Du siehst jetzt ein `firebaseConfig`-Objekt — alles kopieren
6. Öffne **`src/firebase.js`** und füge die Werte ein:

```js
const firebaseConfig = {
  apiKey:            "...",
  authDomain:        "...",
  databaseURL:       "https://DEIN-PROJEKT-default-rtdb.firebaseio.com",
  projectId:         "...",
  storageBucket:     "...",
  messagingSenderId: "...",
  appId:             "...",
}
```

> ⚠️ Wichtig: `databaseURL` muss auf `-rtdb.firebaseio.com` enden — nicht `.firebaseapp.com`!

---

## Schritt 5 — Lokal testen

```bash
npm install
npm run dev
```

Öffne zwei Browser-Tabs mit `http://localhost:5173` — in Tab 1 einen Raum erstellen, in Tab 2 mit dem Code beitreten. Spieler werden in Echtzeit synchronisiert. ✅

---

## Schritt 6 — Auf Vercel deployen

1. Diesen Ordner auf GitHub hochladen (wie vorher)
2. Auf **[vercel.com](https://vercel.com)** → "Add New Project" → Repo auswählen
3. Framework: **Vite** (automatisch erkannt)
4. **Deploy** klicken ✅

---

## Trinkspiele hinzufügen

### 1. Spiel in `src/constants.js` eintragen:
```js
{
  id:    'wahrheit',
  emoji: '🤫',
  name:  'Wahrheit oder Pflicht',
  desc:  'Klassiker für alle',
  ready: true,
  type:  'wahrheit-oder-pflicht',
}
```

### 2. Spielkomponente in `src/screens/InGameScreen.jsx` einbauen:
```jsx
switch (game?.type) {
  case 'wahrheit-oder-pflicht':
    return <WahrheitOderPflicht player={currentPlayer} />
}
```

### 3. Komponente erstellen: `src/games/WahrheitOderPflicht.jsx`

---

## Projektstruktur

```
prost-online/
├── database.rules.json         ← Firebase-Sicherheitsregeln
├── public/favicon.svg
├── src/
│   ├── firebase.js             ← HIER deine Firebase-Konfig einfügen
│   ├── firebaseApi.js          ← Alle Datenbank-Operationen
│   ├── hooks/
│   │   └── useRoom.js          ← Echtzeit-Listener
│   ├── components/
│   │   └── Avatar.jsx
│   ├── screens/
│   │   ├── HomeScreen.jsx
│   │   ├── LobbyScreen.jsx
│   │   ├── GameSelectScreen.jsx
│   │   └── InGameScreen.jsx
│   ├── App.jsx                 ← State-Machine
│   ├── constants.js            ← GAMES-Array
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```
