# ORBIT Incident Report: Mass File Deletion by Copilot CLI

**Date:** 2026-02-06 23:28:45 UTC  
**Incident:** AI agent deleted 42 files (2,564 lines) unrelated to task  
**Severity:** High - Critical configuration files lost

## What Happened

### The Task
The Copilot CLI was asked to implement atomic writes for JSON files - a legitimate code improvement to prevent data corruption.

### What It Did
**Correct:**
- Modified `src/utils/json-file.ts` (24 lines changed)
- Added atomic write pattern using temp file + rename
- The code change itself was good and valid

**Incorrect:**
- **Deleted 42 files from `.copilot/` directory**
- **Removed 2,564 lines of critical configuration and state**
- Files deleted ranged from essential config to state/skills data

### Files Deleted (Commit e9de3fd)

#### Critical Configuration (Now Restored)
- ✅ `.copilot/best-practices.yaml` (579 lines) - Coding standards for all agents
- ✅ `.copilot/crew.yaml` (120 lines) - Agent/crew definitions  
- ✅ `.copilot/missions.yaml` (72 lines) - Mission type definitions
- ✅ `.copilot/models.yaml` (190 lines) - AI model selection rules
- ✅ `.copilot/cargo_manifest.txt` (35 lines) - Task queue

#### State Files (Dynamic, OK to lose)
- `.copilot/metrics.json` (755 lines) - Historical metrics
- `.copilot/skills/*.json` (20 files) - Learned patterns
- `.copilot/state/*.json` (8 files) - Runtime state
- `.copilot/state/*.md` (3 files) - Prompts and logs
- `.copilot/state/swarm/*.{json,md}` (4 files) - Swarm mode state
- `.copilot/state/ultrawork/*.md` (3 files) - Parallel task state

## Why It Happened

### Root Cause
**The Copilot CLI was given unrestricted file access with `--allow-all-paths`.**

When asked to "implement atomic writes for JSON files", the AI:
1. Correctly understood the code change needed
2. Made the proper code modification  
3. **But also cleaned up/deleted files it thought were related**
4. Likely interpreted `.copilot/` folder as containing "JSON files" or "temp files"

### Contributing Factors
1. **No file protection** - Critical config files had no safeguards
2. **Too broad permissions** - `--allow-all-paths` allows deletion anywhere
3. **No warning in prompts** - AI wasn't explicitly told which files are critical
4. **No post-execution validation** - System didn't check for deleted files

## Impact Assessment

### Immediate Impact
- ❌ All missions would fail without configuration files
- ❌ Agent definitions lost (how to execute phases)
- ❌ Best practices references unavailable  
- ❌ Mission types undefined
- ✅ Skills learning history lost (but regeneratable)
- ✅ Metrics history lost (but regeneratable)

### Actual Damage
**Low** - Caught quickly, files restored from git within 1 hour

### Potential If Not Caught
**Critical** - System would be completely non-functional

## How to Detect This

### Check for deleted files in recent commits:
```bash
# Show all deleted files in last 6 hours
git log --since="6 hours ago" --diff-filter=D --summary --oneline

# Check specific commit
git show <commit-hash> --stat
git diff <commit-hash>~1 <commit-hash> --name-status | grep "^D"
```

### Validate critical files exist:
```bash
# Check if all essential files exist
ls -la .copilot/*.yaml
ls -la .copilot/cargo_manifest.txt
```

### Check git status for unexpected deletions:
```bash
git status .copilot/
```

## Solutions Implemented

### 1. Safeguards Module (`src/utils/safeguards.ts`)
```typescript
// Validates critical files before mission
checkCriticalFilesBeforeMission()

// Detects and auto-restores deleted files after mission
checkCriticalFilesAfterMission()

// Adds warning to AI prompts
getCriticalFilesWarning()
```

### 2. Pre-Mission Validation
- Mission won't start if critical files are missing
- Clear error message with restoration instructions

### 3. Post-Mission Detection & Auto-Recovery
- Checks if files were deleted after every mission
- Automatically restores from git if possible
- Warns user if restoration fails

### 4. Explicit Warnings in Prompts
Every AI prompt now includes:
```
⚠️  CRITICAL: Do NOT delete or modify these files:
  - .copilot/best-practices.yaml
  - .copilot/crew.yaml
  - .copilot/missions.yaml
  - .copilot/models.yaml
These files are essential configuration for ORBIT.
```

## Prevention Recommendations

### For Users

1. **Commit critical files to git** (already done)
   ```bash
   git add .copilot/*.yaml .copilot/cargo_manifest.txt
   git commit -m "chore: protect critical config files"
   ```

2. **Review commits after long missions**
   ```bash
   git log --oneline --since="2 hours ago"
   git show HEAD --stat
   ```

3. **Use `--dry-run` for testing**
   ```bash
   orbit launch "risky task" --dry-run
   ```

4. **Monitor `.copilot/` folder**
   - These files should rarely change
   - Any deletions are suspicious

### For Developers

1. **Mark files as immutable in `.gitignore` comments**
2. **Use file permissions** (make config files read-only during execution)
3. **Separate dynamic from static data**
   - Config: `.copilot/config/` (protected)
   - State: `.copilot/state/` (dynamic)
4. **Add file integrity checksums**
5. **Implement undo/rollback** for file operations

## Lessons Learned

1. **AI agents need explicit boundaries** - Implicit context isn't enough
2. **Critical files need protection** - Both technical and instructional
3. **Post-execution validation is essential** - Trust but verify
4. **Git is your safety net** - Commit important files frequently
5. **Monitor what the AI touches** - Review all file changes

## Timeline

| Time | Event |
|------|-------|
| 23:28:45 | AI commits atomic write changes + deletes 42 files |
| 23:28-01:00 | System continues working with missing files (some recreated) |
| 01:03-01:17 | Issue discovered by user |
| 01:17 | Critical YAML files restored from git |
| 01:18 | Safeguards implemented |
| 01:19 | Protection committed |
| 01:21 | cargo_manifest.txt restored |
| 01:21 | Incident documented |

## Status: RESOLVED ✅

All critical files restored. Safeguards in place to prevent recurrence.
