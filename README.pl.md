[English](README.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Italiano](README.it.md) | [Español](README.es.md) | [Polski](README.pl.md) | [Português](README.pt.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md)

# 🛸 ORBIT - Orchestrated Robotic Build & Integration Toolkit

Autonomiczne tworzenie oprogramowania napędzane przez AI z samo-ulepszaniem, inteligentnym wyborem modeli i egzekwowaniem najlepszych praktyk.

> "Houston, mamy start!" 🚀

**Teraz napędzany przez TypeScript dla lepszej niezawodności i bezpieczeństwa typów!**

📚 **[Interaktywna Dokumentacja](docs/index.html)** - Wypróbuj komendy ORBIT w playground przeglądarki!

## Szybki Start

### Instalacja

```bash
# Opcja 1: npm (wszystkie platformy)
npm install -g @davrock/orbit

# Opcja 2: Ze źródła (Unix/macOS)
git clone https://github.com/davrock/orbit.git && cd orbit && ./install.sh

# Opcja 3: Ze źródła (Windows PowerShell)
git clone https://github.com/davrock/orbit.git; cd orbit; .\install.ps1
```

### Użycie

```bash
# Pełny workflow funkcjonalności
orbit launch "dodaj uwierzytelnianie użytkownika"

# Naprawa błędu (używa tańszych modeli)
orbit repair "napraw crash logowania"

# Pętla samo-ulepszania (najpierw przetwarza kolejkę)
orbit evolve

# Sprawdź wykrytą konfigurację
orbit config
```

## 🚀 Misje (Workflow)

| Misja | Fazy | Przypadek Użycia |
|-------|------|------------------|
| `launch` | plan → implement → test → review → commit | Nowe funkcjonalności |
| `repair` | debug → implement → test → commit | Naprawy błędów |
| `warp` | implement → commit | Szybkie zmiany |
| `mayday` | debug → implement → commit | Hotfixy |
| `preflight` | test → implement → test → review → commit | Workflow TDD |
| `shields-up` | plan → implement → security → test → review → commit | Krytyczne bezpieczeństwo |
| `dock` | plan → implement → test → document → commit | Rozwój API |
| `transmit` | implement → review → commit | Dokumentacja |
| `apollo` | wszystkie fazy | Kompleksowy |
| `ralph` | implement → test → review → commit | **Tryb trwały** (nigdy się nie poddaje) |
| `plan` | interview → requirements | **Zbieranie wymagań** (wywiad planistyczny) |
| `ultrawork` | plan → implement → review → commit | **Wykonanie równoległe** (niezależne podzadania) |
| `swarm` | plan → implement → review → commit | **Skoordynowane równoległe** (z zależnościami) |
| `pipeline` | plan → implement → test → review → commit | **Etapy sekwencyjne** (przekazania między etapami) |

```bash
orbit missions  # Pokaż wszystkie
```

### 🎤 Tryb Plan - Interaktywne Zbieranie Wymagań

Komenda `plan` prowadzi interaktywny wywiad planistyczny, aby zebrać szczegółowe wymagania przed wykonaniem:

```bash
# Samodzielne zbieranie wymagań
orbit plan "dodaj funkcjonalność koszyka"

# Użyj z dowolną misją przez flagę --plan
orbit launch --plan "dodaj uwierzytelnianie użytkownika"
orbit warp --plan "refaktoryzuj warstwę bazy danych"
```

**Jak to działa:**
- **Pytania generowane przez AI**: Generuje 5-7 pytań wyjaśniających na podstawie Twojego zadania
- **Interaktywny wywiad**: Zadaje pytania przez interakcję Copilot CLI
- **Inteligentna synteza**: Tworzy szczegółową specyfikację wymagań z odpowiedzi
- **Automatyczna integracja**: Wymagania przepływają do członków zespołu podczas wykonania
- **Zapisuje specyfikację**: Przechowuje zebrane wymagania w `.copilot/state/plan_requirements.json`

### 🔄 Tryb Ralph - Trwałość, Która Się Nie Poddaje

Misja `ralph` to specjalny tryb trwałości, który nie poddaje się, dopóki zadanie nie zostanie zweryfikowane jako ukończone:

```bash
orbit ralph "zaimplementuj złożoną funkcjonalność"
orbit ralph --max-attempts 15 "trudna refaktoryzacja"
```

**Jak to działa:**
- **Automatyczne ponawianie**: Ponawia nieudane fazy do 10 razy (konfigurowalne)
- **Inteligentna eskalacja**: Eskaluje poziom modelu (fast → standard → premium) po 2 próbach
- **Rotacja załogi**: Zmienia członka zespołu po 4 próbach dla nowej perspektywy
- **Zmienność podejścia**: Próbuje różnych strategii implementacji co 3 próby
- **Weryfikacja**: Waliduje ukończenie każdej fazy przed kontynuacją

### ⚡ Tryby Wykonania Równoległego

ORBIT oferuje dwa tryby równoległego wykonywania zadań:

#### 🚀 Tryb Ultrawork - Niezależne Zadania Równoległe

Dystrybuuje niezależne podzadania na równoległe sesje:

```bash
orbit ultrawork "refaktoryzuj codebase z wieloma niezależnymi modułami"
orbit ultrawork --concurrency 6 "optymalizuj wydajność komponentów"
```

#### 🐝 Tryb Swarm - Skoordynowane Wykonanie Równoległe

Inteligentna dystrybucja zadań ze świadomością zależności:

```bash
orbit swarm "zaimplementuj system uwierzytelniania użytkownika"
orbit swarm --concurrency 4 "zbuduj API z bazą danych i testami"
```

## 🧠 Inteligentny Wybór Modelu

Automatycznie wybiera optymalny model LLM na zadanie, aby oszczędzać tokeny:

| Poziom | Ikona | Koszt | Przypadek Użycia |
|--------|-------|-------|------------------|
| `premium` | 🔥 | 3x | Architektura, bezpieczeństwo, złożone debugowanie |
| `standard` | ⚡ | 1x | Ogólny rozwój, testy, przeglądy |
| `fast` | 💨 | 0.5x | Docs, formatowanie, proste poprawki |
| `ecomode` | 🌱 | 0.6x | **Oszczędny** (30-50% oszczędności) |

```bash
orbit launch --premium "audyt bezpieczeństwa"    # Wymuś premium
orbit transmit --economy "zaktualizuj README"    # Wymuś fast
orbit launch --ecomode "dodaj funkcjonalność"    # Tryb oszczędny
orbit fuel                                        # Pokaż zużycie tokenów
```

## 🤖 Integracja Dostawców AI

Opcjonalna walidacja krzyżowa i kontrole spójności z wieloma dostawcami AI:

```bash
# Skonfiguruj zewnętrznych dostawców (opcjonalnie)
export GEMINI_API_KEY="twój-klucz"
export OPENAI_API_KEY="twój-klucz"
export ANTHROPIC_API_KEY="twój-klucz"

# Włącz walidację krzyżową między dostawcami
orbit launch "zaimplementuj API płatności" --cross-validate
```

## 📚 Najlepsze Praktyki

Wszyscy członkowie zespołu odnoszą się do `.copilot/best-practices.yaml` dla standardów:
- Standardy kodowania (TypeScript, Python, JavaScript)
- Wzorce testowania (arrange-act-assert, nazewnictwo)
- Wytyczne bezpieczeństwa (OWASP, walidacja wejścia)
- Konwencje dokumentacji
- Standardy commitów Git

## 🧑‍🚀 Załoga (Agenci)

| Załoga | Rola | Model |
|--------|------|-------|
| `commander` | Architekt systemu | 🔥 premium |
| `pilot` | Implementator | ⚡ standard |
| `engineer` | Detektyw błędów | 🔥 premium |
| `navigator` | Recenzent kodu | ⚡ standard |
| `specialist` | Bohater QA | ⚡ standard |
| `security-officer` | Ninja bezpieczeństwa | 🔥 premium |
| `propulsion` | Wydajność | ⚡ standard |
| `comms` | Dokumentacja | 💨 fast |

```bash
orbit crews
orbit launch --crew security-officer "dodaj auth"
```

## 🧬 Pętla Samo-Ulepszania

Kolejność priorytetów: **Kolejka → GitHub Issues → Samo-Ulepszanie**

```bash
orbit evolve              # Uruchom do zatrzymania
orbit evolve --once       # Pojedynczy cykl
orbit evolve --turbo      # Tryb szybki (30s opóźnienia)
orbit evolve --max 50     # Ogranicz cykle
orbit status              # Pokaż historię
orbit reset               # Zresetuj liczniki failsafe
```

### Manifest Cargo (Kolejka Zadań)

```bash
# Dodaj zadania
orbit cargo-add "Dodaj uwierzytelnianie użytkownika" --priority high
orbit cargo-add "Dodaj przełącznik trybu ciemnego"

# Pokaż kolejkę
orbit cargo

# Przetwórz wszystkie
orbit cargo-run
```

### Failsafe Ground Control 🚨

Zapobiega nieskończonym pętlom:
- ✓ Max 3 kolejne błędy → pauza
- ✓ Max 5 cykli bez postępu → przerwij misję
- ✓ Wykrywa powtarzające się ulepszenia → wymagana różnorodność
- ✓ Cytaty kosmiczne ("Houston, mamy problem!")

## 📋 Planowanie Implementacji

Generuj szczegółowe plany i issues GitHub:

```bash
# Utwórz plan lotu dla funkcjonalności
orbit flight-plan new "Dodaj uwierzytelnianie OAuth2"

# Głębsza analiza
orbit flight-plan new "Refaktoryzuj warstwę bazy danych" --depth 3

# Wylistuj wszystkie plany
orbit flight-plan list

# Generuj issues GitHub z planu
orbit flight-plan issues plan-001
```

## Rozwój

```bash
# Tryb deweloperski (używa tsx)
npm run dev -- launch "zadanie"

# Skompiluj TypeScript
npm run build

# Sprawdzenie typów
npm run typecheck

# Linkuj globalnie
npm link
```

## 💖 Wspieraj i Współtwórz

### Sponsorzy

Jeśli ORBIT oszczędza Twój czas i zwiększa produktywność, rozważ sponsoring:

- ⭐ **Daj gwiazdkę repo** - pomoże innym odkryć ORBIT
- 💰 **GitHub Sponsors** - [Sponsoruj @davrock](https://github.com/sponsors/davrock)
- ☕ **Kup mi kawę** - Wspiera ciągły rozwój

### Współtworzenie

Wkłady są mile widziane! Oto jak:

```bash
# Fork i sklonuj
git clone https://github.com/twoja-nazwa/orbit.git
cd orbit

# Zainstaluj zależności
npm install

# Wprowadź zmiany
npm run dev -- launch "twoje ulepszenie"

# Zbuduj i przetestuj
npm run build
npm run typecheck

# Wyślij PR
git push origin feature/twoje-ulepszenie
```

## Licencja

MIT
