#!/bin/bash
# Pre/Post Phase Hooks System
# Allows custom scripts to run before/after each phase

HOOKS_DIR=".copilot/hooks"

# Initialize hooks directory
init_hooks() {
    mkdir -p "$HOOKS_DIR"
    
    # Create example hooks if they don't exist
    if [ ! -f "$HOOKS_DIR/README.md" ]; then
        cat > "$HOOKS_DIR/README.md" << 'EOF'
# Phase Hooks

Custom scripts that run before or after each phase.

## Hook Files

- `pre-<phase>.sh` - Runs before phase starts
- `post-<phase>.sh` - Runs after phase completes
- `on-failure-<phase>.sh` - Runs if phase fails
- `on-success.sh` - Runs after successful orchestration
- `on-failure.sh` - Runs after failed orchestration

## Phases

- plan
- implement
- test
- review
- debug
- commit

## Examples

### pre-implement.sh
```bash
#!/bin/bash
echo "About to start implementation..."
# Pull latest changes
git pull origin development
```

### post-test.sh
```bash
#!/bin/bash
echo "Tests completed!"
# Generate coverage report
npm run coverage
```

### on-failure-implement.sh
```bash
#!/bin/bash
echo "Implementation failed!"
# Send notification
./notify-slack.sh "Implementation failed: $TASK"
```

## Environment Variables Available

- `WORKFLOW` - Current workflow (feature, fix, etc.)
- `TASK` - Task description
- `PHASE` - Current phase name
- `PROJECT_NAME` - Project name from config
- `HANDOFF_FILE` - Path to handoff file
- `LOG_FILE` - Path to log file

## Making Hooks Executable

```bash
chmod +x .copilot/hooks/pre-implement.sh
```

## Disabling Hooks

Rename or remove the hook file, or make it non-executable.
EOF
    fi
}

# Run hook if it exists
run_hook() {
    local hook_name="$1"
    local hook_file="$HOOKS_DIR/$hook_name.sh"
    
    if [ ! -f "$hook_file" ]; then
        return 0
    fi
    
    if [ ! -x "$hook_file" ]; then
        # Hook exists but not executable - skip silently
        return 0
    fi
    
    echo -e "${CYAN}[hook]${NC} Running $hook_name..."
    
    # Export environment variables for hooks
    export WORKFLOW
    export TASK
    export PHASE
    export PROJECT_NAME
    export HANDOFF_FILE
    export LOG_FILE
    export STATE_DIR
    
    # Run the hook
    if "$hook_file" 2>&1 | tee -a "$LOG_FILE"; then
        echo -e "${GREEN}[hook]${NC} $hook_name completed"
        return 0
    else
        echo -e "${RED}[hook]${NC} $hook_name failed"
        return 1
    fi
}

# Run pre-phase hook
hook_pre_phase() {
    local phase="$1"
    run_hook "pre-$phase"
}

# Run post-phase hook
hook_post_phase() {
    local phase="$1"
    run_hook "post-$phase"
}

# Run on-failure hook for phase
hook_on_failure_phase() {
    local phase="$1"
    run_hook "on-failure-$phase"
}

# Run global success hook
hook_on_success() {
    run_hook "on-success"
}

# Run global failure hook
hook_on_failure() {
    run_hook "on-failure"
}

# List available hooks
list_hooks() {
    if [ ! -d "$HOOKS_DIR" ]; then
        echo "No hooks directory found"
        return
    fi
    
    echo ""
    echo "Available Hooks:"
    echo ""
    
    local found=false
    for hook in "$HOOKS_DIR"/*.sh; do
        if [ -f "$hook" ]; then
            found=true
            local basename=$(basename "$hook")
            local executable="✗"
            [ -x "$hook" ] && executable="✓"
            printf "  [%s] %s\n" "$executable" "$basename"
        fi
    done
    
    if [ "$found" = false ]; then
        echo "  No hooks found"
        echo ""
        echo "Create hooks in: $HOOKS_DIR/"
        echo "Example: $HOOKS_DIR/pre-implement.sh"
    fi
    
    echo ""
}

# Create example hooks
create_example_hooks() {
    init_hooks
    
    # Pre-implement hook
    cat > "$HOOKS_DIR/pre-implement.sh" << 'EOF'
#!/bin/bash
# Pre-implementation hook example
# Runs before implementation phase starts

echo "==> Running pre-implementation checks..."

# Example: Pull latest changes
# git pull origin development

# Example: Clean build artifacts
# rm -rf dist/ build/

echo "==> Pre-implementation checks complete"
EOF
    
    # Post-test hook
    cat > "$HOOKS_DIR/post-test.sh" << 'EOF'
#!/bin/bash
# Post-test hook example
# Runs after test phase completes

echo "==> Running post-test actions..."

# Example: Generate coverage report
# npm run coverage

# Example: Check coverage threshold
# if [ $(jq '.total.lines.pct' coverage/coverage-summary.json) -lt 80 ]; then
#     echo "Coverage below 80%!"
#     exit 1
# fi

echo "==> Post-test actions complete"
EOF
    
    # On-failure hook
    cat > "$HOOKS_DIR/on-failure.sh" << 'EOF'
#!/bin/bash
# Global failure hook example
# Runs when orchestration fails

echo "==> Orchestration failed!"
echo "Task: $TASK"
echo "Workflow: $WORKFLOW"
echo "Check logs: $LOG_FILE"

# Example: Send notification
# curl -X POST https://hooks.slack.com/... \
#   -d "{\"text\": \"Orchestration failed: $TASK\"}"

# Example: Create GitHub issue
# gh issue create \
#   --title "Orchestration failed: $TASK" \
#   --body "Check logs: $LOG_FILE"
EOF
    
    chmod +x "$HOOKS_DIR"/*.sh
    
    echo "Example hooks created in $HOOKS_DIR/"
    echo "Edit and customize them for your needs."
    list_hooks
}
