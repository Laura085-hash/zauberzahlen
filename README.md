# 🦄 Zauberzahlen · Magic Numbers

Un piccolo gioco per la **1ª e 2ª elementare**: numeri fino a 20, poi fino a 100
(decine e unità, numeri vicini, linea dei numeri, pattern, muri e triangoli di numeri)
e le parole del dettato di tedesco. Tema unicorni & magia.

- 📱 Web app installabile sul telefono (PWA, "Aggiungi a schermata Home")
- 🇩🇪🇬🇧 Bilingue **Tedesco / Inglese** (interruttore ⚙️)
- 🔒 Funziona **offline**, tutto sul dispositivo (niente account, niente pubblicità)
- 🧩 HTML + CSS + JavaScript puro, zero dipendenze
- 💡 **Se sbaglia, la risposta non viene mai mostrata**: solo un suggerimento che aiuta a ragionare,
  e si riprova (con scelte rimescolate) finché non ci arriva da sola

## Giochi
| | Allena |
|---|---|
| **Bis 20** | |
| 💎 Magic Count | riconoscere *quante* senza contare |
| 🔮 Power of 5 | la struttura del 5 e del 10 |
| 🍓 Number Bonds | scomporre i numeri, "fai 10" |
| 🌟 Plus Magic | addizione (supporto visivo che sfuma) |
| 🍬 Minus Magic | sottrazione: togliere · differenza · inverso |
| **Bis 100** | |
| 🥚 Tens & Ones | scatole da 10 uova (bündeln), barre e punti, tabella Z\|E |
| 💯 Hundred Magic | 20 + 9, 82 = 80 + 2, 6+2 → 60+20, 7−4 → 70−40 |
| 🏘️ Neighbour Numbers | numero prima/dopo, decine vicine, numero in mezzo |
| 📏 Number Line | leggere e collocare numeri sulla linea, tavola del 100 |
| 🎨 Pattern Magic | pattern di forme, sequenze +1/+2/+5/+10, scale che crescono |
| 🧱 Number Wall | piramidi: due mattoni fanno quello sopra (anche con le decine) |
| 🔺 Number Triangle | dentro + dentro = fuori |
| **Deutsch** | |
| 📝 Diktat | parole del dettato: riconoscere, completare, scrivere (parola, frase con buco, frase intera) |

C'è anche una schermata **genitore** (dietro un mini-cancello) con i progressi e un riepilogo stampabile.

## Provarla in locale
```bash
python -m http.server 8765
# poi apri http://localhost:8765
# un gioco diretto: http://localhost:8765/#play=tens&level=3
```

## Test
```bash
node tests/run.js
```
Gioca tutte le sessioni di tutti i giochi con un DOM finto e controlla che dopo un errore
non venga mai rivelata la risposta.

## Icone
Rigenerabili con `python assets/build_icons.py` (richiede Pillow).
