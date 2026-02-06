#!/bin/bash
# 🧠 ORBIT - Smart Model Selector
# Automatically chooses optimal LLM tier based on task analysis

set -e

# Configuration - exported for potential use by child processes
export METRICS_FILE=".copilot/metrics.json"

# Parse command: ./model-selector.sh "task description" [phase] [crew]
TASK="${1:-}"
PHASE="${2:-implement}"
CREW="${3:-pilot}"

# Color output
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

# Keywords that trigger specific tiers
PREMIUM_KEYWORDS="security|vulnerability|architecture|critical|complex|audit|production|exploit|breach|penetration|redesign|migrate"
FAST_KEYWORDS="typo|rename|comment|format|simple|minor|docs|trivial|readme|fix typo|spelling|whitespace"

# Phase defaults
declare -A PHASE_DEFAULTS=(
    [plan]="standard"
    [implement]="standard"
    [test]="standard"
    [review]="standard"
    [debug]="standard"
    [security]="premium"
    [document]="fast"
    [commit]="fast"
    [research]="standard"
)

# Crew defaults (some crew members need premium for their specialty)
declare -A CREW_DEFAULTS=(
    [commander]="premium"
    [security-officer]="premium"
    [engineer]="standard"
    [mission-planner]="standard"
    [pilot]="standard"
    [specialist]="standard"
    [navigator]="standard"
    [propulsion]="standard"
    [comms]="fast"
    [scout]="standard"
    [ground-control]="standard"
    [hal]="standard"
    [data-scientist]="standard"
    [ml-engineer]="standard"
    [devops]="standard"
    [frontend-specialist]="standard"
    [backend-specialist]="standard"
    [database-architect]="premium"
    [api-designer]="standard"
    [ux-researcher]="fast"
    [tech-writer]="fast"
    [qa-lead]="standard"
    [performance-engineer]="standard"
    [cloud-architect]="premium"
)

# Analyze task complexity
analyze_task() {
    local task="$1"
    local task_lower
    task_lower=$(echo "$task" | tr '[:upper:]' '[:lower:]')
    
    # Check for premium keywords
    if echo "$task_lower" | grep -qiE "$PREMIUM_KEYWORDS"; then
        echo "premium"
        return
    fi
    
    # Check for fast keywords
    if echo "$task_lower" | grep -qiE "$FAST_KEYWORDS"; then
        echo "fast"
        return
    fi
    
    # Default to standard
    echo "standard"
}

# Get file count if we're in a git repo (more files = potentially more complex)
analyze_scope() {
    local scope="small"
    
    if command -v git &>/dev/null && git rev-parse --git-dir &>/dev/null; then
        local changed_files
        changed_files=$(git status --porcelain 2>/dev/null | wc -l)
        
        if [ "$changed_files" -gt 10 ]; then
            scope="large"
        elif [ "$changed_files" -gt 5 ]; then
            scope="medium"
        fi
    fi
    
    echo "$scope"
}

# Main selection logic
select_model() {
    local task="$1"
    local phase="$2"
    local crew="$3"
    
    # Start with phase default
    local phase_tier="${PHASE_DEFAULTS[$phase]:-standard}"
    
    # Check crew preference
    local crew_tier="${CREW_DEFAULTS[$crew]:-standard}"
    
    # Analyze task content
    local task_tier
    task_tier=$(analyze_task "$task")
    
    # Analyze scope
    local scope
    scope=$(analyze_scope)
    
    # Priority: task keywords > crew specialty > scope > phase default
    local final_tier="standard"
    
    # Task analysis overrides everything
    if [ "$task_tier" = "premium" ]; then
        final_tier="premium"
    elif [ "$task_tier" = "fast" ]; then
        # Only use fast if phase and crew also support it
        if [ "$phase_tier" = "fast" ] || [ "$crew_tier" = "fast" ]; then
            final_tier="fast"
        else
            final_tier="standard"
        fi
    else
        # Use highest of crew/phase
        if [ "$crew_tier" = "premium" ] || [ "$phase_tier" = "premium" ]; then
            final_tier="premium"
        elif [ "$crew_tier" = "fast" ] && [ "$phase_tier" = "fast" ]; then
            final_tier="fast"
        fi
    fi
    
    # Scope override: large scope bumps up one tier
    if [ "$scope" = "large" ] && [ "$final_tier" = "fast" ]; then
        final_tier="standard"
    elif [ "$scope" = "large" ] && [ "$final_tier" = "standard" ]; then
        final_tier="premium"
    fi
    
    echo "$final_tier"
}

# Get multiplier for tier
get_multiplier() {
    case "$1" in
        premium) echo "3.0" ;;
        fast) echo "0.5" ;;
        *) echo "1.0" ;;
    esac
}

# Get icon for tier
get_icon() {
    case "$1" in
        premium) echo "🔥" ;;
        fast) echo "💨" ;;
        *) echo "⚡" ;;
    esac
}

# Track usage
track_usage() {
    local tier="$1"
    local mult
    mult=$(get_multiplier "$tier")
    
    python3 -c "
import json, os
f='$METRICS_FILE'
try: d=json.load(open(f)) if os.path.exists(f) else {'model_usage':{'premium':0,'standard':0,'fast':0},'total_cost':0}
except: d={'model_usage':{'premium':0,'standard':0,'fast':0},'total_cost':0}
d['model_usage']['$tier']=d.get('model_usage',{}).get('$tier',0)+1
d['total_cost']=d.get('total_cost',0)+$mult
json.dump(d,open(f,'w'),indent=2)
" 2>/dev/null || true
}

# Main
main() {
    if [ -z "$TASK" ]; then
        echo "Usage: $0 \"task description\" [phase] [crew]"
        echo ""
        echo "Outputs the recommended model tier: premium, standard, or fast"
        exit 1
    fi
    
    local tier
    tier=$(select_model "$TASK" "$PHASE" "$CREW")
    local icon
    icon=$(get_icon "$tier")
    local mult
    mult=$(get_multiplier "$tier")
    
    # Output mode: --json for machine readable, otherwise human
    if [ "${4:-}" = "--json" ]; then
        echo "{\"tier\":\"$tier\",\"multiplier\":$mult,\"phase\":\"$PHASE\",\"crew\":\"$CREW\"}"
    elif [ "${4:-}" = "--quiet" ]; then
        echo "$tier"
    else
        echo -e "${CYAN}🧠 Model Selection${NC}"
        echo -e "  Task: ${YELLOW}${TASK:0:60}...${NC}"
        echo -e "  Phase: $PHASE | Crew: $CREW"
        echo -e "  ${GREEN}Recommended: $icon $tier (${mult}x)${NC}"
    fi
    
    # Track usage if not dry run
    [ "${TRACK:-true}" = "true" ] && track_usage "$tier"
}

main "$@"
