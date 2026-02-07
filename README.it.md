[English](README.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Italiano](README.it.md) | [Español](README.es.md) | [Polski](README.pl.md) | [Português](README.pt.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md)

# 🛸 ORBIT - Orchestrated Robotic Build & Integration Toolkit

Sviluppo software autonomo basato su IA con auto-miglioramento, selezione intelligente dei modelli e applicazione delle best practice.

> "Houston, abbiamo il decollo!" 🚀

**Ora basato su TypeScript per maggiore affidabilità e sicurezza dei tipi!**

📚 **[Documentazione Interattiva](docs/index.html)** - Prova i comandi ORBIT nel playground del browser!

## Avvio Rapido

### Installazione

```bash
# Opzione 1: npm (qualsiasi piattaforma)
npm install -g @davrock/orbit

# Opzione 2: Da sorgente (Unix/macOS)
git clone https://github.com/davrock/orbit.git && cd orbit && ./install.sh

# Opzione 3: Da sorgente (Windows PowerShell)
git clone https://github.com/davrock/orbit.git; cd orbit; .\install.ps1
```

### Utilizzo

```bash
# Workflow completo per feature
orbit launch "aggiungi autenticazione utente"

# Correzione bug (usa modelli più economici)
orbit repair "correggi crash login"

# Ciclo di auto-miglioramento (elabora prima la coda)
orbit evolve

# Controlla configurazione rilevata
orbit config
```

## 🚀 Missioni (Workflow)

| Missione | Fasi | Caso d'Uso |
|----------|------|------------|
| `launch` | plan → implement → test → review → commit | Nuove feature |
| `repair` | debug → implement → test → commit | Correzione bug |
| `warp` | implement → commit | Modifiche rapide |
| `mayday` | debug → implement → commit | Hotfix |
| `preflight` | test → implement → test → review → commit | Workflow TDD |
| `shields-up` | plan → implement → security → test → review → commit | Critico per sicurezza |
| `dock` | plan → implement → test → document → commit | Sviluppo API |
| `transmit` | implement → review → commit | Documentazione |
| `apollo` | tutte le fasi | Completo |
| `ralph` | implement → test → review → commit | **Modalità persistente** (non si arrende mai) |
| `plan` | interview → requirements | **Raccolta requisiti** (intervista di pianificazione) |
| `ultrawork` | plan → implement → review → commit | **Esecuzione parallela** (sotto-task indipendenti) |
| `swarm` | plan → implement → review → commit | **Parallelo coordinato** (con dipendenze) |
| `pipeline` | plan → implement → test → review → commit | **Fasi sequenziali** (passaggi tra fasi) |

```bash
orbit missions  # Mostra tutte
```

### 🎤 Modalità Plan - Raccolta Requisiti Interattiva

Il comando `plan` conduce un'intervista di pianificazione interattiva per raccogliere requisiti dettagliati prima dell'esecuzione:

```bash
# Raccolta requisiti autonoma
orbit plan "aggiungi funzionalità carrello"

# Usa con qualsiasi missione tramite flag --plan
orbit launch --plan "aggiungi autenticazione utente"
orbit warp --plan "refactoring livello database"
```

**Come funziona:**
- **Domande generate dall'IA**: Genera 5-7 domande di chiarimento basate sul tuo task
- **Intervista interattiva**: Pone domande tramite interazione Copilot CLI
- **Sintesi intelligente**: Crea specifiche requisiti dettagliate dalle risposte
- **Integrazione automatica**: I requisiti fluiscono ai membri del team durante l'esecuzione
- **Salva specifiche**: Memorizza i requisiti raccolti in `.copilot/state/plan_requirements.json`

### 🔄 Modalità Ralph - Persistenza che Non Si Arrende Mai

La missione `ralph` è una modalità di persistenza speciale che non si arrende finché il task non è verificato come completato:

```bash
orbit ralph "implementa feature complessa"
orbit ralph --max-attempts 15 "refactoring difficile"
```

**Come funziona:**
- **Retry automatico**: Riprova le fasi fallite fino a 10 volte (configurabile)
- **Escalation intelligente**: Scala il livello del modello (fast → standard → premium) dopo 2 tentativi
- **Rotazione crew**: Cambia membro del team dopo 4 tentativi per nuova prospettiva
- **Variazione approccio**: Prova diverse strategie di implementazione ogni 3 tentativi
- **Verifica**: Valida il completamento di ogni fase prima di procedere

### ⚡ Modalità di Esecuzione Parallela

ORBIT offre due modalità per l'esecuzione parallela dei task:

#### 🚀 Modalità Ultrawork - Task Paralleli Indipendenti

Distribuisce sotto-task indipendenti su sessioni concorrenti:

```bash
orbit ultrawork "refactoring codebase con moduli indipendenti multipli"
orbit ultrawork --concurrency 6 "ottimizza performance su componenti"
```

#### 🐝 Modalità Swarm - Esecuzione Parallela Coordinata

Distribuzione intelligente dei task con consapevolezza delle dipendenze:

```bash
orbit swarm "implementa sistema autenticazione utente"
orbit swarm --concurrency 4 "costruisci API con database e test"
```

## 🧠 Selezione Intelligente del Modello

Seleziona automaticamente il modello LLM ottimale per task per risparmiare token:

| Livello | Icona | Costo | Caso d'Uso |
|---------|-------|-------|------------|
| `premium` | 🔥 | 3x | Architettura, sicurezza, debugging complesso |
| `standard` | ⚡ | 1x | Sviluppo generale, test, review |
| `fast` | 💨 | 0.5x | Docs, formattazione, fix semplici |
| `ecomode` | 🌱 | 0.6x | **Budget-conscious** (30-50% risparmio) |

```bash
orbit launch --premium "audit sicurezza"        # Forza premium
orbit transmit --economy "aggiorna README"      # Forza fast
orbit launch --ecomode "aggiungi feature"       # Modalità budget-conscious
orbit fuel                                      # Visualizza uso token
```

## 🤖 Integrazione Provider IA

Cross-validazione opzionale e controlli di consistenza usando più provider IA:

```bash
# Configura provider esterni (opzionale)
export GEMINI_API_KEY="tua-chiave"
export OPENAI_API_KEY="tua-chiave"
export ANTHROPIC_API_KEY="tua-chiave"

# Abilita cross-validazione tra provider
orbit launch "implementa API pagamento" --cross-validate
```

## 📚 Best Practice

Tutti i membri del team fanno riferimento a `.copilot/best-practices.yaml` per gli standard:
- Standard di codifica (TypeScript, Python, JavaScript)
- Pattern di testing (arrange-act-assert, naming)
- Linee guida sicurezza (OWASP, validazione input)
- Convenzioni documentazione
- Standard commit Git

## 🧑‍🚀 Crew (Agenti)

| Crew | Ruolo | Modello |
|------|-------|---------|
| `commander` | Architetto di sistema | 🔥 premium |
| `pilot` | Implementatore | ⚡ standard |
| `engineer` | Detective dei bug | 🔥 premium |
| `navigator` | Code reviewer | ⚡ standard |
| `specialist` | Eroe QA | ⚡ standard |
| `security-officer` | Ninja sicurezza | 🔥 premium |
| `propulsion` | Performance | ⚡ standard |
| `comms` | Documentazione | 💨 fast |

```bash
orbit crews
orbit launch --crew security-officer "aggiungi auth"
```

## 🧬 Ciclo di Auto-Miglioramento

Ordine di priorità: **Coda → GitHub Issues → Auto-Miglioramento**

```bash
orbit evolve              # Esegui fino allo stop
orbit evolve --once       # Singolo ciclo
orbit evolve --turbo      # Modalità veloce (30s delay)
orbit evolve --max 50     # Limita cicli
orbit status              # Mostra cronologia
orbit reset               # Reset contatori failsafe
```

### Cargo Manifest (Coda Task)

```bash
# Aggiungi task
orbit cargo-add "Aggiungi autenticazione utente" --priority high
orbit cargo-add "Aggiungi toggle dark mode"

# Visualizza coda
orbit cargo

# Elabora tutti
orbit cargo-run
```

### Ground Control Failsafe 🚨

Previene loop infiniti:
- ✓ Max 3 fallimenti consecutivi → cooldown
- ✓ Max 5 cicli senza progresso → abort missione
- ✓ Rileva miglioramenti ripetitivi → varietà richiesta
- ✓ Citazioni spaziali ("Houston, abbiamo un problema!")

## 📋 Pianificazione Implementazione

Genera piani dettagliati e GitHub issues:

```bash
# Crea un flight plan per una feature
orbit flight-plan new "Aggiungi autenticazione OAuth2"

# Analisi più approfondita
orbit flight-plan new "Refactoring livello database" --depth 3

# Elenca tutti i piani
orbit flight-plan list

# Genera GitHub issues da un piano
orbit flight-plan issues plan-001
```

## Sviluppo

```bash
# Modalità sviluppo (usa tsx)
npm run dev -- launch "task"

# Compila TypeScript
npm run build

# Type check
npm run typecheck

# Link globale
npm link
```

## 💖 Supporta e Contribuisci

### Sponsor

Se ORBIT ti fa risparmiare tempo e aumenta la tua produttività, considera di sponsorizzare:

- ⭐ **Metti una stella al repo** - aiuta altri a scoprire ORBIT
- 💰 **GitHub Sponsors** - [Sponsorizza @davrock](https://github.com/sponsors/davrock)
- ☕ **Offrimi un caffè** - Supporta lo sviluppo continuo

### Contribuire

I contributi sono benvenuti! Ecco come:

```bash
# Fork e clona
git clone https://github.com/tuo-username/orbit.git
cd orbit

# Installa dipendenze
npm install

# Fai le tue modifiche
npm run dev -- launch "il tuo miglioramento"

# Build e test
npm run build
npm run typecheck

# Invia PR
git push origin feature/tuo-miglioramento
```

## Licenza

MIT
