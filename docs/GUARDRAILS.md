# ORBIT Guardrails

> Rules and constraints for autonomous and assisted operation.

## 🚨 Critical: Never Do These

These are absolute rules. If any action would violate them, **stop immediately**.

### 1. Protected Paths — DO NOT TOUCH

| Path | What It Is | Why It's Protected |
|------|-----------|-------------------|
| `.copilot/` | GitHub Copilot's workspace | Not ours — never delete, move, or modify anything here |
| `src/config/skills/` | ORBIT's learning memory | Accumulated knowledge from successful missions |
| `src/config/state/` | Runtime state & logs | Ground control, fuel tracking, checkpoints, flight log |
| `src/config/plans/` | Flight plans | Planned work items and implementation steps |
| `src/config/*.yaml` | Configuration files | Best practices, crew definitions, mission types, model config |

**What happens if you delete them:** ORBIT loses its memory, state, and configuration. Skills are not recoverable. State tracking resets. Crew definitions disappear.

### 2. Destructive Commands — NEVER EXECUTE

```
❌  rm -rf
❌  drop database
❌  git push --force (to main/production branches)
❌  chmod 777
❌  kill -9 (on system processes)
❌  Any command that bulk-deletes files
```

### 3. Secrets — NEVER COMMIT

```
❌  API keys, tokens, passwords
❌  .env files with real credentials
❌  Private SSH keys
❌  Database connection strings with credentials
❌  Any file matching: *.pem, *.key, *secret*, *credential*
```

---

## ⚠️ Constraints for Autonomous Mode (`orbit evolve`)

These rules apply whenever ORBIT is running self-improvement cycles.

### Priority Hierarchy

When choosing what to improve, follow this exact order:

| Priority | Category | Action |
|----------|----------|--------|
| P0 | Critical bugs | Crashes, data loss, breaking changes → **FIX FIRST** |
| P1 | Security | Vulnerabilities, auth issues, injection risks → **FIX SECOND** |
| P2 | Stability | Error handling, edge cases, reliability → **FIX THIRD** |
| P3 | Test coverage | Missing tests, flaky tests, coverage gaps → **ADD FOURTH** |
| P4 | Performance | Bottlenecks, memory leaks, slow operations → **OPTIMIZE FIFTH** |
| P5 | Code quality | Tech debt, duplication, maintainability → **REFACTOR SIXTH** |
| P6 | Documentation | Missing docs, outdated comments → **UPDATE SEVENTH** |
| P7 | Features | New functionality → **ONLY if P0–P6 are satisfied** |

### Scope Limits

- **One change per cycle.** Make the smallest change that solves the problem.
- **One concern per commit.** Don't bundle unrelated fixes.
- **No dependency changes.** Don't add, remove, or update `package.json` dependencies.
- **No breaking changes.** Don't alter public CLI commands or exported function signatures.
- **No file removal.** Don't delete existing source files or tests unless fixing dead code.

### Verification Checklist

**All of these must pass before committing:**

```bash
npm run build      # ✓ Zero TypeScript errors
npm test           # ✓ All 637+ tests pass
# No new lint warnings introduced
# Existing functionality still works
```

If any check fails → fix it → re-run all checks → only commit when everything passes.

### Failsafe Triggers

| Condition | Action |
|-----------|--------|
| 3 consecutive failures | 60-second cooldown, reset fail counter |
| 5 no-progress cycles | Abort the evolve loop entirely |
| Repetitive patterns detected | Require variety in next improvement |

---

## ✅ What You CAN Do

### During Autonomous Operation

- ✅ Add new tests for uncovered critical paths
- ✅ Fix bugs and handle uncaught errors
- ✅ Improve error handling and recovery
- ✅ Refactor for clarity (with tests proving equivalence)
- ✅ Optimize performance (with measurable evidence)
- ✅ Update documentation to match current behavior
- ✅ Add input validation and security checks

### During Assisted Operation

All of the above, plus:

- ✅ Add new features when explicitly requested
- ✅ Create new agents (`src/agents/definitions/<name>.yaml`)
- ✅ Add new mission types with user approval
- ✅ Modify configuration files when instructed

---

## 🛡️ Pre/Post-Mission Safeguards

ORBIT automatically runs integrity checks before and after every mission.

### Pre-Mission (`checkCriticalFilesBeforeMission`)

1. Verify all critical YAML configs exist in `src/config/`
2. Verify state directories are present
3. If any are missing → **abort the mission** and alert the user

### Post-Mission (`checkCriticalFilesAfterMission`)

1. Re-check all critical files after AI execution
2. If any were deleted during the mission:
   - Warn the user
   - Attempt auto-restore via `git checkout HEAD -- <file>`
   - Log the incident

### Recovery Commands

If files are lost, restore them:

```bash
# Restore all config files
git checkout HEAD -- src/config/*.yaml

# Restore skills
git checkout HEAD -- src/config/skills/

# Restore state
git checkout HEAD -- src/config/state/

# Full restore
git checkout HEAD -- src/config/
```

---

## 🔒 Code Quality Gates

### TypeScript

- **Strict mode** is mandatory. No escape hatches (`@ts-ignore`, `as any`).
- All exported functions must have **explicit return types**.
- Use `unknown` instead of `any`; narrow with type guards.

### Commits

- Format: `<type>: <description>`
- Types: `fix`, `feat`, `test`, `refactor`, `perf`, `docs`, `security`
- Description explains **what** and **why**, not how.

### Tests

- Every behavioral change needs a corresponding test update.
- Tests use **Arrange-Act-Assert** pattern.
- Test files live alongside source: `<module>.test.ts`.
- No test should depend on external services or network.

---

## 📊 Monitoring

ORBIT tracks its own health through:

| System | File | What It Tracks |
|--------|------|---------------|
| Ground Control | `src/config/state/ground_control.json` | Fail/success counters, cycle count |
| Fuel Tracking | `src/config/state/fuel_tracking.json` | Token usage by model tier |
| Metrics | `src/config/metrics.json` | Run history, success rates, durations |
| Skills | `src/config/skills/*.json` | Learned patterns and their success rates |
| Flight Log | `src/config/state/flight_log.md` | Human-readable activity history |
| Mission Log | `src/config/state/mission.log` | Machine-readable timestamped log |

Use `orbit status`, `orbit fuel`, `orbit skills`, `orbit metrics`, or `orbit hud` to inspect.
