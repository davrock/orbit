# 🛸 ORBIT Quickstart Guide
## Orchestrated Robotic Build & Integration Toolkit

> "Houston, we have liftoff!" 🚀

**Powered by TypeScript for reliability and type safety!**

---

## 📋 Table of Contents

1. [Installation](#-installation)
2. [Core Features](#-core-features)
   - [Mission Control](#1-mission-control)
   - [Cargo Bay](#2-cargo-bay)
   - [Launch Sequence](#3-launch-sequence)
3. [Planning & Issues](#-planning--issues)
4. [Smart Features](#-smart-features)
5. [Configuration](#-configuration)
6. [Examples](#-examples)

---

## 📦 Installation

### Option 1: npm (Recommended)

Install globally from npm (works on Windows, macOS, Linux):

```bash
npm install -g @davrock/orbit
```

Then run from any project:
```bash
orbit --help
```

### Option 2: From Source

Clone and install locally:

```bash
git clone https://github.com/davrock/orbit.git
cd orbit

# Unix/macOS/Linux
./install.sh

# Windows (PowerShell)
.\install.ps1
```

### Option 3: Development Mode

Run without installing:
```bash
npm install && npm run build
npm run dev -- --help
npm run dev -- launch "your task"
```

### Verify Installation

```bash
orbit --version   # Check version
orbit config      # Verify project detection
```

### Zero Configuration

ORBIT auto-detects everything from your project files:

- ✅ Project name (package.json, Cargo.toml, go.mod, pom.xml, etc.)
- ✅ Tech stack (Node, Python, Go, Rust, Java, Ruby, .NET, PHP)
- ✅ Test command (npm test, pytest, go test, cargo test)
- ✅ Type checker (tsc, mypy, go vet, cargo check)
- ✅ Linter (eslint, ruff, clippy)
- ✅ Git branch, package manager

```bash
orbit config   # Verify detection
```

---

## 🚀 Core Features

### 1. Mission Control

The main orchestrator. Runs multi-phase development workflows.

```bash
orbit launch "add user authentication"    # Full feature
orbit repair "fix login crash"            # Bug fix
orbit warp "rename variable"              # Quick change
orbit shields-up "add payment processing" # Security-focused
```

**Available Missions:**

| Mission | Phases | Use Case |
|---------|--------|----------|
| `launch` | plan → implement → test → review → commit | New features |
| `repair` | debug → implement → test → commit | Bug fixes |
| `warp` | implement → commit | Quick changes |
| `mayday` | debug → implement → commit | Hotfixes |
| `preflight` | test → implement → test → review → commit | TDD workflow |
| `shields-up` | plan → implement → security → test → review → commit | Security |
| `dock` | plan → implement → test → document → commit | API development |
| `transmit` | implement → review → commit | Documentation |
| `apollo` | all phases | Comprehensive |

**Options:**
```bash
orbit missions              # List all
orbit crews                 # List crew members
orbit launch --premium "task"    # Force premium model (3x)
orbit launch --economy "task"    # Force fast model (0.5x)
orbit launch --dry-run "task"    # Preview
orbit launch -i "task"           # Interactive mode
orbit launch --crew pilot "task" # Override crew
```

---

### 2. Cargo Bay

Task queue processor.

```bash
orbit cargo                         # Show manifest
orbit cargo-add "Add dark mode"     # Add task
orbit cargo-add "Fix bug" -p high   # High priority
orbit cargo-run                     # Process all
```

**Manifest:** `.copilot/cargo_manifest.txt`

```text
# HIGH PRIORITY
Add user authentication

# MEDIUM PRIORITY
Add dark mode toggle

# LOW PRIORITY
Update dependencies

# COMPLETED
# ✓ Initial setup (2024-01-15)
```

---

### 3. Launch Sequence

Self-improvement loop. Processes work in priority order:

1. **Cargo** → Tasks from manifest
2. **GitHub Issues** → Open issues
3. **Self-Improve** → AI finds improvements

```bash
orbit evolve              # Continuous (Ctrl+C to stop)
orbit evolve --once       # Single cycle
orbit evolve --turbo      # Fast mode (30s delay)
orbit evolve --max 10     # Limit iterations
orbit status              # View state
orbit reset               # Reset failsafes
```

**Failsafes (Ground Control):**
- Max 3 failures → 60s cooldown
- Max 5 no-progress → abort
- Stuck loop detection
- Auto-escalates model on failure

---

## 📋 Planning & Issues

### Flight Plan

Generate implementation plans:

```bash
orbit flight-plan new "Add OAuth2"              # Create plan
orbit flight-plan new "Refactor DB" --depth 3   # Detailed
orbit flight-plan list                          # List all
orbit flight-plan show plan-001                 # View plan
orbit flight-plan issues plan-001               # → GitHub issues
```

**Depth Levels:**

| Depth | Tasks | Detail |
|-------|-------|--------|
| 1 | 3-5 | Quick |
| 2 | 8-12 | Standard (default) |
| 3 | 15+ | Comprehensive |

**Output:** `.copilot/plans/plan-XXX.md`

---

## 🧠 Smart Features

### Model Selection

Auto-selects optimal LLM tier:

| Tier | Icon | Cost | Used For |
|------|------|------|----------|
| `premium` | 🔥 | 3x | Security, architecture, complex debug |
| `standard` | ⚡ | 1x | Development, tests, reviews |
| `fast` | 💨 | 0.5x | Docs, formatting, simple fixes |

```bash
orbit fuel   # View usage
```

### Best Practices

All agents reference `.copilot/best-practices.yaml`:
- Coding standards (TypeScript, Python, JS)
- Testing patterns (AAA, naming)
- Security guidelines (OWASP)
- Documentation conventions
- Git commit standards

### Crew (Agents)

| Crew | Role | Tier |
|------|------|------|
| `commander` | Architect | 🔥 |
| `pilot` | Implementer | ⚡ |
| `engineer` | Debugger | 🔥 |
| `navigator` | Reviewer | ⚡ |
| `specialist` | QA | ⚡ |
| `security-officer` | Security | 🔥 |
| `comms` | Docs | 💨 |
| `hal` | Self-improve | ⚡ |

```bash
orbit crews   # List all
```

---

## ⚙️ Configuration

### Auto-Detection

| Source | Detects |
|--------|---------|
| `package.json` | Name, Node stack, npm/pnpm/yarn |
| `tsconfig.json` | TypeScript |
| `Cargo.toml` | Rust, cargo |
| `go.mod` | Go |
| `pom.xml` / `build.gradle` | Java, maven/gradle |
| `requirements.txt` | Python, pip |
| `.eslintrc.*` | ESLint |
| git | Branch |

```bash
orbit config   # View all
```

### File Structure

```
orbit/
├── src/                    # TypeScript source
│   ├── cli/                # CLI commands
│   ├── core/               # Types, detection, state
│   ├── workflows/          # Mission control, cargo, etc.
│   └── utils/              # Output, git, exec
├── dist/                   # Compiled JS
├── .copilot/
│   ├── best-practices.yaml # Standards
│   ├── cargo_manifest.txt  # Task queue
│   ├── plans/              # Flight plans
│   └── state/              # Runtime state
├── package.json
└── tsconfig.json
```

---

## 💡 Examples

### Daily Development

```bash
orbit launch "add user settings page"
orbit repair "null pointer in login"
orbit transmit "update API docs"
orbit shields-up "add payment"
```

### Batch Processing

```bash
orbit cargo-add "Add dark mode" -p high
orbit cargo-add "Improve errors"
orbit cargo-run
```

### Autonomous Operation

```bash
orbit evolve              # Until stopped
orbit evolve --max 10     # 10 cycles
```

### Planning Workflow

```bash
orbit flight-plan new "Add OAuth2" --depth 3
orbit flight-plan show plan-001
orbit flight-plan issues plan-001
```

---

## 🚀 Quick Reference

| Command | Purpose |
|---------|---------|
| `orbit launch "task"` | Full feature workflow |
| `orbit repair "task"` | Bug fix |
| `orbit warp "task"` | Quick change |
| `orbit cargo-run` | Process queue |
| `orbit evolve` | Self-improvement loop |
| `orbit flight-plan new "feat"` | Create plan |
| `orbit config` | Show configuration |
| `orbit fuel` | Token usage |

---

*"To infinity and beyond!"* 🚀
