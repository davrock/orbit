#!/bin/bash
# Checkpoint and Resume System for Orchestrator
# Allows resuming from failed phases

CHECKPOINT_FILE=".copilot/state/checkpoint.json"

# Save checkpoint before each phase
checkpoint_save() {
    local workflow="$1"
    local task="$2"
    local phase="$3"
    local phases_completed="$4"
    
    mkdir -p "$(dirname "$CHECKPOINT_FILE")"
    
    cat > "$CHECKPOINT_FILE" << EOF
{
  "version": "1.0",
  "workflow": "$workflow",
  "task": "$task",
  "current_phase": "$phase",
  "phases_completed": "$phases_completed",
  "timestamp": "$(date -Iseconds)",
  "handoff_file": "$HANDOFF_FILE",
  "log_file": "$LOG_FILE"
}
EOF
}

# Load checkpoint
checkpoint_load() {
    if [ ! -f "$CHECKPOINT_FILE" ]; then
        return 1
    fi
    
    if ! command -v jq &> /dev/null; then
        echo "Error: jq required for checkpoint/resume"
        return 1
    fi
    
    # Export checkpoint data
    export CHECKPOINT_WORKFLOW=$(jq -r '.workflow' "$CHECKPOINT_FILE")
    export CHECKPOINT_TASK=$(jq -r '.task' "$CHECKPOINT_FILE")
    export CHECKPOINT_PHASE=$(jq -r '.current_phase' "$CHECKPOINT_FILE")
    export CHECKPOINT_PHASES_COMPLETED=$(jq -r '.phases_completed' "$CHECKPOINT_FILE")
    export CHECKPOINT_TIMESTAMP=$(jq -r '.timestamp' "$CHECKPOINT_FILE")
    
    return 0
}

# Check if checkpoint exists
checkpoint_exists() {
    [ -f "$CHECKPOINT_FILE" ]
}

# Show checkpoint info
checkpoint_info() {
    if [ ! -f "$CHECKPOINT_FILE" ]; then
        echo "No checkpoint found"
        return 1
    fi
    
    if ! command -v jq &> /dev/null; then
        echo "jq required to read checkpoint"
        return 1
    fi
    
    local workflow=$(jq -r '.workflow' "$CHECKPOINT_FILE")
    local task=$(jq -r '.task' "$CHECKPOINT_FILE")
    local phase=$(jq -r '.current_phase' "$CHECKPOINT_FILE")
    local completed=$(jq -r '.phases_completed' "$CHECKPOINT_FILE")
    local timestamp=$(jq -r '.timestamp' "$CHECKPOINT_FILE")
    
    cat << EOF

╔══════════════════════════════════════════════╗
║         Checkpoint Information               ║
╚══════════════════════════════════════════════╝

Workflow:          $workflow
Task:              $task
Failed at Phase:   $phase
Phases Completed:  $completed
Timestamp:         $timestamp

To resume: ./copilot-orchestrate-v5 --resume

EOF
}

# Clear checkpoint
checkpoint_clear() {
    rm -f "$CHECKPOINT_FILE"
}

# Get remaining phases from checkpoint
checkpoint_get_remaining_phases() {
    if ! checkpoint_exists || ! command -v jq &> /dev/null; then
        return 1
    fi
    
    local completed=$(jq -r '.phases_completed' "$CHECKPOINT_FILE")
    local workflow=$(jq -r '.workflow' "$CHECKPOINT_FILE")
    
    # Get full phase list for workflow
    local all_phases
    case "$workflow" in
        feature) all_phases="plan implement test review commit" ;;
        fix)     all_phases="debug implement test commit" ;;
        refactor) all_phases="implement test review commit" ;;
        test)    all_phases="test review commit" ;;
        *) return 1 ;;
    esac
    
    # Filter out completed phases
    local remaining=""
    local found_start=false
    for phase in $all_phases; do
        if [ "$found_start" = true ]; then
            remaining="$remaining $phase"
        fi
        if echo "$completed" | grep -qw "$phase"; then
            found_start=true
        fi
    done
    
    # If no completed phases found, start from current phase
    if [ -z "$remaining" ]; then
        local current=$(jq -r '.current_phase' "$CHECKPOINT_FILE")
        for phase in $all_phases; do
            if [ "$phase" = "$current" ] || [ -n "$remaining" ]; then
                remaining="$remaining $phase"
            fi
        done
    fi
    
    echo "$remaining"
}

# Resume from checkpoint
checkpoint_resume() {
    if ! checkpoint_load; then
        echo "No valid checkpoint found or jq not available"
        return 1
    fi
    
    echo "Resuming from checkpoint..."
    echo "  Task: $CHECKPOINT_TASK"
    echo "  Workflow: $CHECKPOINT_WORKFLOW"
    echo "  Last completed: $CHECKPOINT_PHASES_COMPLETED"
    echo "  Failed at: $CHECKPOINT_PHASE"
    echo ""
    
    # Get remaining phases
    local remaining_phases
    remaining_phases=$(checkpoint_get_remaining_phases)
    
    if [ -z "$remaining_phases" ]; then
        echo "Error: Could not determine remaining phases"
        return 1
    fi
    
    echo "Remaining phases: $remaining_phases"
    echo ""
    
    # Return phases to resume from
    echo "$remaining_phases"
}
