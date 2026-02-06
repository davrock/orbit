#!/bin/bash
# 🖥️ ORBIT - HUD Statusline
# Real-time orchestration metrics display
# Shows: phase, crew, model tier, time elapsed, fuel usage

# Colors (exported for subshells)
export CYAN='\033[0;36m'
export GREEN='\033[0;32m'
export MAGENTA='\033[0;35m'
export DIM='\033[2m'
export BOLD='\033[1m'
export NC='\033[0m'

STATE_DIR=".copilot/state"
HUD_FILE="$STATE_DIR/hud.json"
FUEL_FILE="$STATE_DIR/fuel_tracking.json"

# Initialize HUD state
init_hud() {
    mkdir -p "$STATE_DIR"
    cat > "$HUD_FILE" << EOF
{
  "phase": "idle",
  "crew": "none",
  "model_tier": "standard",
  "task": "",
  "start_time": 0,
  "phases_complete": 0,
  "phases_total": 0
}
EOF
}

# Update HUD state
update_hud() {
    local key="$1"
    local value="$2"
    
    [ ! -f "$HUD_FILE" ] && init_hud
    
    python3 -c "
import json
with open('$HUD_FILE', 'r') as f:
    d = json.load(f)
d['$key'] = '$value' if not '$value'.isdigit() else int('$value')
with open('$HUD_FILE', 'w') as f:
    json.dump(d, f, indent=2)
" 2>/dev/null
}

# Start mission tracking
start_mission() {
    local task="$1"
    local phases="$2"
    
    init_hud
    
    local phase_count
    phase_count=$(echo "$phases" | wc -w)
    local start_time
    start_time=$(date +%s)
    
    python3 -c "
import json
d = {
    'phase': 'starting',
    'crew': 'none',
    'model_tier': 'standard',
    'task': '''$task'''[:60],
    'start_time': $start_time,
    'phases_complete': 0,
    'phases_total': $phase_count,
    'status': 'running'
}
with open('$HUD_FILE', 'w') as f:
    json.dump(d, f, indent=2)
" 2>/dev/null
}

# Update phase
set_phase() {
    local phase="$1"
    local crew="$2"
    local tier="$3"
    
    python3 -c "
import json
with open('$HUD_FILE', 'r') as f:
    d = json.load(f)
d['phase'] = '$phase'
d['crew'] = '$crew'
d['model_tier'] = '$tier'
with open('$HUD_FILE', 'w') as f:
    json.dump(d, f, indent=2)
" 2>/dev/null
}

# Mark phase complete
complete_phase() {
    python3 -c "
import json
with open('$HUD_FILE', 'r') as f:
    d = json.load(f)
d['phases_complete'] = d.get('phases_complete', 0) + 1
with open('$HUD_FILE', 'w') as f:
    json.dump(d, f, indent=2)
" 2>/dev/null
}

# End mission
end_mission() {
    local status="${1:-complete}"
    update_hud "status" "$status"
    update_hud "phase" "done"
}

# Get elapsed time formatted
get_elapsed() {
    [ ! -f "$HUD_FILE" ] && echo "0:00" && return
    
    python3 -c "
import json
import time
with open('$HUD_FILE', 'r') as f:
    d = json.load(f)
start = d.get('start_time', 0)
if start == 0:
    print('0:00')
else:
    elapsed = int(time.time() - start)
    mins = elapsed // 60
    secs = elapsed % 60
    print(f'{mins}:{secs:02d}')
" 2>/dev/null || echo "0:00"
}

# Get fuel usage
get_fuel() {
    [ ! -f "$FUEL_FILE" ] && echo "0.0" && return
    
    python3 -c "
import json
with open('$FUEL_FILE', 'r') as f:
    d = json.load(f)
print(f\"{d.get('total', 0):.1f}\")
" 2>/dev/null || echo "0.0"
}

# Get tier icon
get_tier_icon() {
    case "$1" in
        premium) echo "🔥" ;;
        fast) echo "💨" ;;
        *) echo "⚡" ;;
    esac
}

# Get phase icon
get_phase_icon() {
    case "$1" in
        plan) echo "📋" ;;
        implement) echo "🔨" ;;
        test) echo "🧪" ;;
        review) echo "👁️" ;;
        debug) echo "🔍" ;;
        security) echo "🔒" ;;
        document) echo "📝" ;;
        commit) echo "💾" ;;
        research) echo "🔬" ;;
        *) echo "🚀" ;;
    esac
}

# Render statusline
render() {
    [ ! -f "$HUD_FILE" ] && return
    
    local data
    data=$(cat "$HUD_FILE")
    
    local phase crew tier task phases_complete phases_total status
    phase=$(echo "$data" | python3 -c "import json,sys; print(json.load(sys.stdin).get('phase','idle'))" 2>/dev/null)
    crew=$(echo "$data" | python3 -c "import json,sys; print(json.load(sys.stdin).get('crew','none'))" 2>/dev/null)
    tier=$(echo "$data" | python3 -c "import json,sys; print(json.load(sys.stdin).get('model_tier','standard'))" 2>/dev/null)
    task=$(echo "$data" | python3 -c "import json,sys; print(json.load(sys.stdin).get('task','')[:40])" 2>/dev/null)
    phases_complete=$(echo "$data" | python3 -c "import json,sys; print(json.load(sys.stdin).get('phases_complete',0))" 2>/dev/null)
    phases_total=$(echo "$data" | python3 -c "import json,sys; print(json.load(sys.stdin).get('phases_total',0))" 2>/dev/null)
    status=$(echo "$data" | python3 -c "import json,sys; print(json.load(sys.stdin).get('status','idle'))" 2>/dev/null)
    
    local elapsed fuel
    elapsed=$(get_elapsed)
    fuel=$(get_fuel)
    
    local phase_icon tier_icon
    phase_icon=$(get_phase_icon "$phase")
    tier_icon=$(get_tier_icon "$tier")
    
    # Build progress bar
    local progress=""
    if [ "$phases_total" -gt 0 ]; then
        local pct=$((phases_complete * 100 / phases_total))
        local filled=$((pct / 10))
        local empty=$((10 - filled))
        progress="["
        for ((i=0; i<filled; i++)); do progress+="█"; done
        for ((i=0; i<empty; i++)); do progress+="░"; done
        progress+="] ${phases_complete}/${phases_total}"
    fi
    
    # Render based on mode
    case "${1:-inline}" in
        inline)
            # Single line statusline
            echo -e "${DIM}┃${NC} ${phase_icon} ${CYAN}${phase^^}${NC} │ 👨‍🚀 ${crew} │ ${tier_icon} ${tier} │ ⏱ ${elapsed} │ ⛽ ${fuel} ${progress:+│ $progress} ${DIM}┃${NC}"
            ;;
        box)
            # Box format
            echo -e "${MAGENTA}╭─────────────────────────────────────────────────────────────╮${NC}"
            echo -e "${MAGENTA}│${NC} ${BOLD}🛸 ORBIT HUD${NC}                                               ${MAGENTA}│${NC}"
            echo -e "${MAGENTA}├─────────────────────────────────────────────────────────────┤${NC}"
            echo -e "${MAGENTA}│${NC} Task: ${CYAN}${task}${NC}"
            echo -e "${MAGENTA}│${NC} Phase: ${phase_icon} ${GREEN}${phase^^}${NC} │ Crew: ${crew}"
            echo -e "${MAGENTA}│${NC} Model: ${tier_icon} ${tier} │ Time: ${elapsed} │ Fuel: ${fuel}"
            [ -n "$progress" ] && echo -e "${MAGENTA}│${NC} Progress: ${progress}"
            echo -e "${MAGENTA}╰─────────────────────────────────────────────────────────────╯${NC}"
            ;;
        json)
            cat "$HUD_FILE"
            ;;
        minimal)
            echo -e "${phase_icon} ${phase} │ ${tier_icon} │ ${elapsed}"
            ;;
    esac
}

# Watch mode - continuously update display
watch_mode() {
    local interval="${1:-2}"
    
    while true; do
        clear
        render box
        sleep "$interval"
        
        # Check if mission ended
        local status
        status=$(python3 -c "import json; print(json.load(open('$HUD_FILE')).get('status',''))" 2>/dev/null)
        [ "$status" = "complete" ] || [ "$status" = "failed" ] && break
    done
}

# Help
show_help() {
    cat << 'EOF'
🖥️ ORBIT HUD Statusline

Usage: ./.copilot/hud.sh <command> [args]

COMMANDS:
  init                    Initialize HUD state
  start "task" "phases"   Start mission tracking
  phase <p> <crew> <tier> Update current phase
  complete                Mark phase complete
  end [status]            End mission (complete/failed)
  render [mode]           Display statusline
  watch [interval]        Continuous display
  
RENDER MODES:
  inline   Single line (default)
  box      Box format
  minimal  Compact
  json     Raw JSON
  
EXAMPLES:
  ./.copilot/hud.sh start "Add login" "plan implement test commit"
  ./.copilot/hud.sh phase implement pilot standard
  ./.copilot/hud.sh complete
  ./.copilot/hud.sh render box
EOF
}

# Main
case "${1:-}" in
    init) init_hud ;;
    start) start_mission "$2" "$3" ;;
    phase) set_phase "$2" "$3" "$4" ;;
    complete) complete_phase ;;
    end) end_mission "$2" ;;
    render) render "$2" ;;
    watch) watch_mode "$2" ;;
    update) update_hud "$2" "$3" ;;
    elapsed) get_elapsed ;;
    fuel) get_fuel ;;
    -h|--help|help) show_help ;;
    "") render inline ;;
    *) echo "Unknown command: $1"; show_help; exit 1 ;;
esac
