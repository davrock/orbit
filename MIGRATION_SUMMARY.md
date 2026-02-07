# ORBIT Configuration Migration Summary

## Changes Made (2026-02-07)

### 🎯 Objective
Move all ORBIT configuration files from `.copilot/` to `src/config/` to:
1. Prevent accidental deletion by GitHub Copilot's autonomous modes
2. Keep ORBIT's files separate from GitHub Copilot's workspace
3. Add critical warnings about the `.copilot` directory

### 📁 Directory Structure

**Before:**
```
.copilot/
├── best-practices.yaml
├── crew.yaml
├── missions.yaml
├── models.yaml
├── cargo_manifest.txt
├── metrics.json
├── dashboard/
├── plans/
├── skills/      (ORBIT's learning memory)
└── state/       (ORBIT's runtime state)
```

**After:**
```
.copilot/        (Protected - GitHub Copilot's directory - DO NOT TOUCH)
src/config/
├── best-practices.yaml
├── crew.yaml
├── missions.yaml
├── models.yaml
├── cargo_manifest.txt
├── metrics.json
├── .orbit-protect (Protection notice)
├── dashboard/
├── plans/
├── skills/      (ORBIT's learning memory)
└── state/       (ORBIT's runtime state)
```

### 🚨 Critical Protections Added

1. **Enhanced Constitutional Constraints** in `autonomous-prompts.ts`:
   - Added prominent warning: "DO NOT DELETE, MOVE, OR MODIFY ANYTHING IN .copilot/ DIRECTORY"
   - Protected `.copilot/**` - GitHub Copilot's own directory
   - Updated all references to use `src/config/` paths

2. **Updated Safeguards** in `safeguards.ts`:
   - Added `.copilot` to protected directories list
   - Updated critical file paths to `src/config/`

3. **Protection File** created at `src/config/.orbit-protect`

### 📝 Files Updated

**Core Files:**
- `src/core/state.ts` - Updated default paths
- `src/core/autonomous-prompts.ts` - Enhanced protections + path updates
- `src/core/checkpoint.ts` - Updated state directory
- `src/core/hud.ts` - Updated state directory
- `src/core/metrics.ts` - Updated metrics file path
- `src/core/skills.ts` - Updated skills directory
- `src/core/skills.test.ts` - Updated test paths

**Workflow Files:**
- `src/workflows/deploy.ts` - Updated source paths (keeps target as `.copilot`)
- `src/workflows/dashboard.ts` - Updated dashboard directory
- `src/workflows/doctor.ts` - Updated diagnostic paths
- `src/workflows/flight-plan.ts` - Updated plans directory
- `src/workflows/mission-control.ts` - Updated state paths + prompts
- `src/workflows/pipeline.ts` - Updated state paths + prompts
- `src/workflows/plan-mode.ts` - Updated state directory
- `src/workflows/swarm.ts` - Updated state paths + prompts
- `src/workflows/ultrawork.ts` - Updated state paths + prompts

**Utility Files:**
- `src/utils/safeguards.ts` - Updated protected paths

### ✅ Verification

All changes verified:
- ✓ Build successful: `npm run build`
- ✓ All tests passing: `npm test` (637 tests)
- ✓ ORBIT status works
- ✓ ORBIT doctor works
- ✓ Evolve prompt includes critical .copilot protection
- ✓ All paths updated to src/config

### 🔄 Migration Impact

**For Existing ORBIT Installations:**
- Existing `.copilot` directories in target projects remain unchanged
- `orbit deploy` command still creates `.copilot` in target projects
- ORBIT's own development now uses `src/config`

**For New Projects:**
- `orbit deploy` will create `.copilot` structure (industry standard)
- ORBIT development protects both directories

### 🎓 Key Learnings

1. **Separation of Concerns**: Keep tool config separate from workspace
2. **Defensive Programming**: Multiple layers of protection (code + warnings + docs)
3. **Backward Compatibility**: Deploy still uses `.copilot` for target projects
