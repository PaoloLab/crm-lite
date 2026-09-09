# Northline CRM — Design System

Estratto dal mockup `Northline CRM.dc.html`. Tutti i valori sono quelli effettivamente usati nel design.

---

## Colori

| Ruolo | Hex | Note d'uso |
|---|---|---|
| Primario (accento azioni) | `#4E7CFF` | Bottone primario, tab attiva, toggle ON, stage "Qualificato", pallini attività |
| Primario hover | `#3F6BEF` | Hover bottone primario |
| Primario — fondo tenue | `#26375C` | Sfondo icona sidebar attiva, flash riga nuova trattativa |
| Primario — testo su scuro | `#B9CCFF` | Link, valori numerici accento, voci menu cliccabili |
| Sfondo pagina | `#0F171F` | Area centrale, topbar |
| Sfondo profondo | `#121B24` | Sidebar, pannello destro, pannello sinistro login |
| Sfondo card / superficie 1 | `#1B2733` | Card metriche, colonne kanban, tabella, modale, input login |
| Superficie 2 | `#22303E` | Card trattativa, input modale, header tabella, riga espansa |
| Superficie 3 | `#2B3B4A` | Avatar, badge tag, tooltip, tab attiva, hover icone |
| Bordo | `#2E3D4B` | Bordi input, modale, tooltip, avatar |
| Bordo tenue | `#243240` | Divisori, bordi card e colonne, separatori riga |
| Testo primario | `#EDF1F4` | Titoli, nomi azienda, valori |
| Testo secondario | `#9FB0BE` | Etichette, testo di supporto, icone inattive-hover |
| Testo muted | `#657686` | Micro-label uppercase, timestamp, placeholder, stage "Nuovo lead" |
| Successo / positivo | `#3AD6A0` | Delta positivi, stage "Vinto", probabilità di chiusura |
| Successo — fondo | `#1B3D33` | Badge delta positivo |
| Warning | `#F2B84B` | Stage "Proposta inviata", sparkline in calo |
| Warning — fondo | `#403420` | Badge su fondo ambra |
| Errore / urgenza | `#FF6E61` | Pallino "trattativa calda", delta negativi, voce "Esci", badge notifiche |
| Errore — fondo | `#402521` | Badge delta negativo, banner errore login |
| Errore — bordo banner | `#5A322C` | Solo banner errore login |
| Errore — testo banner | `#FFC2BB` | Solo banner errore login |
| Bianco (su accento) | `#FFFFFF` | Testo bottone primario, knob toggle, spunta checkbox |
| Overlay modale | `rgba(8,13,18,.6)` | + `backdrop-filter: blur(2px)` |

Gradiente logo: `linear-gradient(155deg, #4E7CFF, #2A4FCC)`.

---

## Tipografia

**Font family**
- Display / titoli: `Fraunces`, serif — weight 400/500/600
- Interfaccia: `Inter`, sans-serif — weight 400/500/600/700
- Dati e numeri: `IBM Plex Mono`, monospace — weight 400/500

**Scala**

| Uso | Font | Size | Weight | Altro |
|---|---|---|---|---|
| H1 login | Fraunces | 42px | 500 | `line-height:1.15; letter-spacing:-0.02em` |
| H1 pagina ("Pipeline vendite") | Fraunces | 28px | 500 | `letter-spacing:-0.01em` |
| Titolo modale | Fraunces | 26px | 500 | anche H2 "Accedi" |
| Valore metrica card | Fraunces | 26px | 500 | — |
| Logo wordmark | Fraunces | 19px | 500 | — |
| Logo monogramma | Fraunces | 18px | 600 | — |
| Titolo pannello destro | Fraunces | 16px | 500 | — |
| Sottotitolo login | Inter | 15px | 400 | `line-height:1.6` |
| Nome azienda / label form | Inter | 14px | 600 | — |
| Bottone login (full width) | Inter | 14px | 600 | — |
| Body, bottoni, input, ricerca | Inter | 13.5px | 400 (600 sui bottoni) | — |
| Riga tabella, task, dettagli | Inter | 13px | 400 | — |
| Header colonna kanban | Inter | 13px | 600 | `uppercase; letter-spacing:.04em` |
| Testo secondario / attività | Inter | 12.5px | 400 | `line-height:1.5` |
| Micro-label uppercase | Inter | 11.5px | 400 | `uppercase; letter-spacing:.04em` |
| Header tabella | Inter | 11.5px | 400 | `uppercase; letter-spacing:.04em` |
| Timestamp attività | IBM Plex Mono | 11px | 400 | — |
| Badge tag card | IBM Plex Mono | 10.5px | 400 | — |
| Valore trattativa | IBM Plex Mono | 13px | 400 | — |
| Numero grande login | IBM Plex Mono | 22px | 400 | — |
| Badge delta metrica | IBM Plex Mono | 11.5px | 400 | — |
| Avatar iniziali (topbar/riga) | Inter | 12.5px / 10px | 600 | — |

`-webkit-font-smoothing: antialiased` sul body. `text-wrap: pretty` sui titoli e paragrafi lunghi del login.

---

## Spaziature

**Padding ricorrenti**
- Area main: `26px 24px 40px`
- Topbar: `0 24px` (altezza fissa 64px)
- Pannello destro: `22px 18px`
- Sidebar: `18px 0`
- Card metrica: `16px 18px`
- Colonna kanban: `14px`
- Card trattativa: `12px 13px` (variante compatta: `8px 10px`)
- Modale: `24px`
- Riga tabella: `12px 16px`
- Riga espansa: `16px 16px 18px 52px`
- Header tabella: `12px 16px`
- Input: `9px 12px` (login `11px 13px`, con occhio `11px 42px 11px 13px`)
- Bottone primario topbar: `9px 16px`; bottone modale primario `9px 18px`; secondario `9px 16px`
- Badge/pill: `2px 7px`, `2px 8px`, `3px 8px`
- Tooltip: `5px 9px`
- Voce menu utente: `8px 10px`
- Pannello login: `56px 60px`

**Gap**
- Griglia metriche: `14px` (4 colonne `1fr`)
- Board kanban: `14px` (colonne `minmax(240px, 1fr)`, min-width 240px)
- Card kanban tra loro: `margin-bottom: 10px`
- Griglia dettaglio riga espansa: `18px` (4 colonne)
- Topbar elementi destra: `14px`; gruppo ricerca: `10px`; bottone icona+testo: `8px`
- Icone sidebar: `6px` (gap dopo il logo: `margin-bottom:22px`)
- Riga tabella: `14px`
- Campi modale: `14px`; campi login: `16px`; coppia valore/stage: `12px`
- Bottoni footer modale: `10px`
- Task pannello destro: `9px 0` + gap interno `10px`
- Attività: `margin-bottom:16px`, gap `10px`
- Sezioni pannello destro: `26px`

**Layout**
- Griglia app: `76px | 1fr | 300px` × `64px | 1fr`
- Canvas mockup: `1440 × 900px` (min-height)
- Modale: `480px` (max `90vw`)
- Campo ricerca: `max-width 420px`
- Form login: `max-width 360px`; split login `1.15fr | 1fr`

---

## Bordi e ombre

**Border-radius**
- Card metrica, colonna kanban, tabella: `12px`
- Modale: `14px`
- Menu utente: `10px`
- Logo / icona sidebar attiva: `10px`
- Bottoni (tutti), input, select, card trattativa: `8px`
- Icone azione riga: `7px`
- Icone sidebar/topbar, voci menu: `8px` / `6px`
- Tooltip: `6px`
- Checkbox: `4px`
- Pill/badge e toggle: `20px`
- Avatar e pallini di stato: `50%`
- Barre sparkline: `2px 2px 0 0`

**Bordi**
- Standard: `1px solid #2E3D4B`
- Divisori e card: `1px solid #243240`
- Bordo sinistro card trattativa (colore stage): `3px` (compatto `2px`)
- Indicatore sidebar attiva: barra `3px × 20px`, radius `2px`, colore `#4E7CFF`
- Checkbox / checkbox task: `1.5px solid`

**Box-shadow**
- Modale: `0 24px 60px rgba(0,0,0,.45)`
- Menu utente: `0 18px 40px rgba(0,0,0,.45)`
- Tooltip: `0 6px 16px rgba(0,0,0,.35)`
- Pulse trattativa calda (`@keyframes nl-pulse`, 1.8s ease-in-out infinite): da `0 0 0 0 rgba(255,110,97,.5)` a `0 0 0 5px rgba(255,110,97,0)`
- Flash nuova trattativa (`@keyframes nl-flash`, 1.1s ease-out ×2): da `0 0 0 0 rgba(78,124,255,.55)` a `0 0 0 8px rgba(78,124,255,0)`

---

## Componenti chiave

### Bottone primario
- Padding `9px 16px` (modale `9px 18px`), radius `8px`, nessun bordo
- Background `#4E7CFF`, testo `#FFFFFF`, Inter 13.5px / 600
- Hover: background `#3F6BEF`
- Variante full-width (login): `width:100%`, padding `12px`, font 14px/600
- Icona opzionale a sinistra, 15px, gap 8px

### Bottone secondario
- Padding `9px 16px`, radius `8px`, background `transparent`, bordo `1px solid #2E3D4B`
- Testo `#9FB0BE`, Inter 13.5px / 600
- Hover: non definito

### Card
- **Card metrica**: background `#1B2733`, bordo `1px solid #243240`, radius `12px`, padding `16px 18px`, colonna con gap `10px`. Contiene micro-label 12px muted, badge delta, valore Fraunces 26px, sparkline 7 barre alte 26px con gap 3px (ultima barra in colore pieno, precedenti nel tono `-dim`).
- **Card trattativa (kanban)**: background `#22303E`, bordo `1px solid #243240`, bordo sinistro `3px` nel colore dello stage, radius `8px`, padding `12px 13px`, margin-bottom `10px`. Hover: `translateY(-2px)` + bordo `#2E3D4B`, transizione `.12s`.
- **Colonna kanban**: background `#1B2733`, bordo `1px solid #243240`, radius `12px`, padding `14px`, min-width `240px`.

### Badge / etichetta di stato
- **Badge delta metrica**: padding `2px 7px`, radius `20px`, IBM Plex Mono 11.5px; positivo `#3AD6A0` su `#1B3D33`, negativo `#FF6E61` su `#402521`
- **Contatore colonna**: padding `2px 8px`, radius `20px`, background `#22303E`, testo `#657686`, mono 11.5px
- **Tag card**: padding `3px 8px`, radius `20px`, background `#2B3B4A`, testo `#657686`, mono 10.5px
- **Pallino stage**: 7px, `border-radius:50%`, colore per stage — Nuovo lead `#657686`, Qualificato `#4E7CFF`, Proposta inviata `#F2B84B`, Vinto `#3AD6A0`
- **Pallino "trattativa calda"**: 8px (7px in tabella), `#FF6E61`, animazione `nl-pulse`
- **Banner errore login**: background `#402521`, bordo `1px solid #5A322C`, radius `8px`, padding `9px 12px`, testo `#FFC2BB` 12.5px, icona 14px

### Input
- `width:100%`, `box-sizing:border-box`, padding `9px 12px` (login `11px 13px`), radius `8px`
- Background `#22303E` (login `#1B2733`), bordo `1px solid #2E3D4B`, testo `#EDF1F4` 13.5px Inter
- Placeholder colore `#657686`
- Label sopra il campo: 11.5px uppercase `#657686`, `letter-spacing:.04em`, `margin-bottom:6px`
- Campo valore: font IBM Plex Mono; select stessa struttura dell'input; input `type="date"` stessa struttura
- Stato focus: non definito
- **Campo ricerca topbar**: background `#1B2733`, bordo `1px solid #2E3D4B`, radius `8px`, padding `9px 14px`, icona 15px opacità .7, testo 13.5px `#657686`
- **Toggle**: track `36×20px` radius 20px (`#2B3B4A` OFF / `#4E7CFF` ON), knob `16px` bianco, `left` 2px→18px, transizione `.15s`
- **Checkbox**: `16px`, radius `4px`, bordo `1.5px`, riempimento `#4E7CFF` con spunta bianca `stroke-width:3`

### Sidebar
- Larghezza `76px`, background `#121B24`, bordo destro `1px solid #243240`, padding `18px 0`, icone in colonna con gap `6px`
- Logo `38×38px`, radius `10px`, gradiente, monogramma Fraunces 18px/600 bianco
- Voce icona: `44×44px`, radius `8px`, icona 19px, colore `#657686`
- Voce attiva: background `#26375C`, icona `#B9CCFF`, barra indicatore `3×20px` `#4E7CFF` a sinistra
- Hover: background `#1B2733`, icona `#9FB0BE`
- "Esci" ancorata in basso (`flex:1` spaziatore, `margin-bottom:8px`)

### Topbar
- Altezza `64px`, background `#0F171F`, bordo inferiore `1px solid #243240`, padding `0 24px`
- Contiene: campo ricerca (sx), bottone primario "Nuova trattativa", icona notifiche `36×36px` radius 8px con pallino `7px` `#FF6E61` bordato `1.5px` col colore pagina, avatar `34×34px` radius 50% background `#2B3B4A` bordo `1px solid #2E3D4B`
- Hover icone: background `#1B2733`

### Tooltip (icone azione riga)
- Posizionato sopra l'icona (`bottom:38px`, centrato), background `#2B3B4A`, bordo `1px solid #2E3D4B`, radius `6px`, padding `5px 9px`, testo `#EDF1F4` 11.5px, `white-space:nowrap`, `z-index:5`
- Trigger: `onMouseEnter` / `onMouseLeave` sull'icona `30×30px`

### Tabella (vista Elenco)
- Contenitore: background `#1B2733`, bordo `1px solid #243240`, radius `12px`, `overflow:hidden`
- Header: background `#22303E`, padding `12px 16px`, label 11.5px uppercase muted
- Colonne (larghezze fisse): chevron `22px`, Azienda `200px`, Stage `130px`, Valore `110px`, Contatto `170px`, Aggiornato `110px`, Azioni `flex:1`
- Riga: padding `12px 16px`, gap `14px`, bordo superiore `1px solid #243240`, hover background `#22303E`
- Riga espansa: background `#22303E`, padding `16px 16px 18px 52px`, griglia 4 colonne gap `18px`
- Chevron 15px, rotazione `180deg` quando aperta, transizione `.15s`

### Menu utente (dropdown avatar)
- `196px`, background `#1B2733`, bordo `1px solid #2E3D4B`, radius `10px`, padding `6px`, offset `top:44px; right:0`, `z-index:40`
- Header con nome 13px/600 + email 11.5px muted, divisore `1px solid #243240`
- Voci: padding `8px 10px`, radius `6px`, 13px `#9FB0BE`, hover background `#22303E`; "Esci" in `#FF6E61` con icona 14px

### Icone
Nessuna libreria: SVG inline `viewBox="0 0 24 24"`, `fill:none`, `stroke:currentColor`, `stroke-width` 1.8–2.2, dimensioni 14/15/16/19px. I tracciati seguono lo stile **Lucide / Feather** — in Next.js usare `lucide-react` con `size` 15–19 e `strokeWidth` 1.8.

---

## Non definito
- Stato focus/disabled di input e bottoni
- Drag & drop reale delle card kanban (visivamente suggerito, non implementato)
- Vista "Previsioni", pagine Contatti / Attività / Report / Impostazioni
- Dark/light mode alternativa (esiste solo il tema scuro)
- Scala di spaziatura formalizzata a token, breakpoint responsive (il mockup è a larghezza fissa 1440px)
- Stati di errore su campi form del modale (solo blocco silenzioso se manca l'azienda)
