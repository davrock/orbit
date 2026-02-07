[English](README.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Italiano](README.it.md) | [Español](README.es.md) | [Polski](README.pl.md) | [Português](README.pt.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md)

# 🛸 ORBIT - Orchestrated Robotic Build & Integration Toolkit

KI-gesteuerte autonome Softwareentwicklung mit Selbstverbesserung, intelligenter Modellauswahl und Best-Practice-Durchsetzung.

> "Houston, wir haben Abheben!" 🚀

**Jetzt mit TypeScript für bessere Zuverlässigkeit und Typsicherheit!**

📚 **[Interaktive Dokumentation](docs/index.html)** - Probiere ORBIT-Befehle im Browser-Playground aus!

## Schnellstart

### Installation

```bash
# Option 1: npm (alle Plattformen)
npm install -g @davrock/orbit

# Option 2: Aus Quellcode (Unix/macOS)
git clone https://github.com/davrock/orbit.git && cd orbit && ./install.sh

# Option 3: Aus Quellcode (Windows PowerShell)
git clone https://github.com/davrock/orbit.git; cd orbit; .\install.ps1
```

### Verwendung

```bash
# Vollständiger Feature-Workflow
orbit launch "Benutzerauthentifizierung hinzufügen"

# Fehlerbehebung (verwendet günstigere Modelle)
orbit repair "Login-Absturz beheben"

# Selbstverbesserungsschleife (verarbeitet zuerst die Warteschlange)
orbit evolve

# Erkannte Konfiguration prüfen
orbit config
```

## 🚀 Missionen (Workflows)

| Mission | Phasen | Anwendungsfall |
|---------|--------|----------------|
| `launch` | plan → implement → test → review → commit | Neue Features |
| `repair` | debug → implement → test → commit | Fehlerbehebungen |
| `warp` | implement → commit | Schnelle Änderungen |
| `mayday` | debug → implement → commit | Hotfixes |
| `preflight` | test → implement → test → review → commit | TDD-Workflow |
| `shields-up` | plan → implement → security → test → review → commit | Sicherheitskritisch |
| `dock` | plan → implement → test → document → commit | API-Entwicklung |
| `transmit` | implement → review → commit | Dokumentation |
| `apollo` | alle Phasen | Umfassend |
| `ralph` | implement → test → review → commit | **Persistenter Modus** (gibt nie auf) |
| `plan` | interview → requirements | **Anforderungserfassung** (Planungsinterview) |
| `ultrawork` | plan → implement → review → commit | **Parallele Ausführung** (unabhängige Teilaufgaben) |
| `swarm` | plan → implement → review → commit | **Koordinierte Parallelität** (mit Abhängigkeiten) |
| `pipeline` | plan → implement → test → review → commit | **Sequenzielle Stufen** (Übergaben zwischen Stufen) |

```bash
orbit missions  # Alle anzeigen
```

### 🎤 Plan-Modus - Interaktive Anforderungserfassung

Der `plan`-Befehl führt ein interaktives Planungsinterview durch, um detaillierte Anforderungen vor der Ausführung zu sammeln:

```bash
# Eigenständige Anforderungserfassung
orbit plan "Warenkorb-Feature hinzufügen"

# Mit jeder Mission über --plan Flag verwenden
orbit launch --plan "Benutzerauthentifizierung hinzufügen"
orbit warp --plan "Datenbankschicht refaktorisieren"
```

**So funktioniert es:**
- **KI-generierte Fragen**: Generiert 5-7 klärende Fragen basierend auf Ihrer Aufgabe
- **Interaktives Interview**: Stellt Fragen über Copilot CLI-Interaktion
- **Intelligente Synthese**: Erstellt detaillierte Anforderungsspezifikation aus Antworten
- **Automatische Integration**: Anforderungen fließen während der Ausführung zu Teammitgliedern
- **Speichert Spezifikation**: Speichert gesammelte Anforderungen in `.copilot/state/plan_requirements.json`

### 🔄 Ralph-Modus - Persistenz, die nie aufgibt

Die `ralph`-Mission ist ein spezieller Persistenz-Modus, der nicht aufgibt, bis die Aufgabe verifiziert abgeschlossen ist:

```bash
orbit ralph "komplexes Feature implementieren"
orbit ralph --max-attempts 15 "schwieriges Refactoring"
```

**So funktioniert es:**
- **Automatischer Wiederholungsversuch**: Wiederholt fehlgeschlagene Phasen bis zu 10 Mal (konfigurierbar)
- **Intelligente Eskalation**: Eskaliert Modellstufe (fast → standard → premium) nach 2 Versuchen
- **Crew-Rotation**: Wechselt Teammitglied nach 4 Versuchen für neue Perspektive
- **Ansatzvariation**: Probiert alle 3 Versuche verschiedene Implementierungsstrategien
- **Verifizierung**: Validiert jeden Phasenabschluss vor dem Fortfahren

### ⚡ Parallele Ausführungsmodi

ORBIT bietet zwei Modi für parallele Aufgabenausführung:

#### 🚀 Ultrawork-Modus - Unabhängige parallele Aufgaben

Verteilt unabhängige Teilaufgaben über parallele Sitzungen:

```bash
orbit ultrawork "Codebase mit mehreren unabhängigen Modulen refaktorisieren"
orbit ultrawork --concurrency 6 "Performance über Komponenten optimieren"
```

#### 🐝 Schwarm-Modus - Koordinierte parallele Ausführung

Intelligente Aufgabenverteilung mit Abhängigkeitsbewusstsein:

```bash
orbit swarm "Benutzerauthentifizierungssystem implementieren"
orbit swarm --concurrency 4 "API mit Datenbank und Tests bauen"
```

## 🧠 Intelligente Modellauswahl

Wählt automatisch das optimale LLM-Modell pro Aufgabe, um Tokens zu sparen:

| Stufe | Icon | Kosten | Anwendungsfall |
|-------|------|--------|----------------|
| `premium` | 🔥 | 3x | Architektur, Sicherheit, komplexes Debugging |
| `standard` | ⚡ | 1x | Allgemeine Entwicklung, Tests, Reviews |
| `fast` | 💨 | 0.5x | Docs, Formatierung, einfache Fixes |
| `ecomode` | 🌱 | 0.6x | **Budgetbewusst** (30-50% Ersparnis) |

```bash
orbit launch --premium "Sicherheitsaudit"    # Premium erzwingen
orbit transmit --economy "README aktualisieren" # Fast erzwingen
orbit launch --ecomode "Feature hinzufügen"   # Budgetbewusster Modus
orbit fuel                                    # Token-Verbrauch anzeigen
```

## 🤖 KI-Provider-Integration

Optionale Cross-Validierung und Konsistenzprüfungen mit mehreren KI-Providern:

```bash
# Externe Provider einrichten (optional)
export GEMINI_API_KEY="ihr-schlüssel"
export OPENAI_API_KEY="ihr-schlüssel"
export ANTHROPIC_API_KEY="ihr-schlüssel"

# Cross-Validierung über Provider aktivieren
orbit launch "Payment-API implementieren" --cross-validate
```

## 📚 Best Practices

Alle Teammitglieder referenzieren `.copilot/best-practices.yaml` für Standards:
- Coding-Standards (TypeScript, Python, JavaScript)
- Testing-Patterns (arrange-act-assert, Namensgebung)
- Sicherheitsrichtlinien (OWASP, Eingabevalidierung)
- Dokumentationskonventionen
- Git-Commit-Standards

## 🧑‍🚀 Crew (Agenten)

| Crew | Rolle | Modell |
|------|-------|--------|
| `commander` | Systemarchitekt | 🔥 premium |
| `pilot` | Implementierer | ⚡ standard |
| `engineer` | Bug-Detektiv | 🔥 premium |
| `navigator` | Code-Reviewer | ⚡ standard |
| `specialist` | QA-Held | ⚡ standard |
| `security-officer` | Sicherheits-Ninja | 🔥 premium |
| `propulsion` | Performance | ⚡ standard |
| `comms` | Dokumentation | 💨 fast |

```bash
orbit crews
orbit launch --crew security-officer "Auth hinzufügen"
```

## 🧬 Selbstverbesserungsschleife

Prioritätsreihenfolge: **Warteschlange → GitHub Issues → Selbstverbesserung**

```bash
orbit evolve              # Bis zum Stoppen ausführen
orbit evolve --once       # Einzelner Zyklus
orbit evolve --turbo      # Schnellmodus (30s Verzögerung)
orbit evolve --max 50     # Zyklen begrenzen
orbit status              # Verlauf anzeigen
orbit reset               # Failsafe-Zähler zurücksetzen
```

### Cargo-Manifest (Aufgabenwarteschlange)

```bash
# Aufgaben hinzufügen
orbit cargo-add "Benutzerauthentifizierung hinzufügen" --priority high
orbit cargo-add "Dark-Mode-Toggle hinzufügen"

# Warteschlange anzeigen
orbit cargo

# Alle verarbeiten
orbit cargo-run
```

### Ground Control Failsafes 🚨

Verhindert Endlosschleifen:
- ✓ Max 3 aufeinanderfolgende Fehler → Abkühlung
- ✓ Max 5 Zyklen ohne Fortschritt → Mission abbrechen
- ✓ Erkennt repetitive Verbesserungen → Abwechslung erforderlich
- ✓ Weltraum-Zitate ("Houston, wir haben ein Problem!")

## 📋 Implementierungsplanung

Detaillierte Pläne und GitHub Issues generieren:

```bash
# Flugplan für ein Feature erstellen
orbit flight-plan new "OAuth2-Authentifizierung hinzufügen"

# Tiefere Analyse
orbit flight-plan new "Datenbankschicht refaktorisieren" --depth 3

# Alle Pläne auflisten
orbit flight-plan list

# GitHub Issues aus einem Plan generieren
orbit flight-plan issues plan-001
```

## Entwicklung

```bash
# Entwicklungsmodus (verwendet tsx)
npm run dev -- launch "Aufgabe"

# TypeScript kompilieren
npm run build

# Typprüfung
npm run typecheck

# Global verlinken
npm link
```

## 💖 Unterstützen & Beitragen

### Sponsoren

Wenn ORBIT Ihnen Zeit spart und Ihre Produktivität steigert, erwägen Sie eine Unterstützung:

- ⭐ **Repo mit Stern markieren** - hilft anderen, ORBIT zu entdecken
- 💰 **GitHub Sponsors** - [Sponsor @davrock](https://github.com/sponsors/davrock)
- ☕ **Kaffee spendieren** - Unterstützt die Weiterentwicklung

### Beitragen

Beiträge willkommen! So geht's:

```bash
# Fork und klonen
git clone https://github.com/ihr-benutzername/orbit.git
cd orbit

# Abhängigkeiten installieren
npm install

# Änderungen vornehmen
npm run dev -- launch "Ihre Verbesserung"

# Bauen und testen
npm run build
npm run typecheck

# PR einreichen
git push origin feature/ihre-verbesserung
```

## Lizenz

MIT
