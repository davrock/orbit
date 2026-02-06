#!/bin/bash
# Metrics Collection Library for Orchestrator
# Tracks timing, success rates, and feature complexity

METRICS_FILE=".copilot/metrics.json"

# Initialize metrics file if it doesn't exist
init_metrics() {
    if [ ! -f "$METRICS_FILE" ]; then
        cat > "$METRICS_FILE" << 'EOF'
{
  "version": "1.0",
  "runs": []
}
EOF
    fi
}

# Start a new metrics entry
metrics_start() {
    local task="$1"
    local workflow="$2"
    
    # Store in temp file for current run
    cat > /tmp/metrics_current_$$.json << EOF
{
  "task": "$task",
  "workflow": "$workflow",
  "started": "$(date -Iseconds)",
  "phases": [],
  "files_changed": 0,
  "tests_added": 0,
  "retries": 0,
  "validations": {
    "type_check": null,
    "tests": null
  }
}
EOF
}

# Record phase start
metrics_phase_start() {
    local phase="$1"
    local temp_file="/tmp/metrics_current_$$.json"
    
    if [ ! -f "$temp_file" ]; then
        return
    fi
    
    # Add phase start time to temp metrics
    local phase_data="{\"name\":\"$phase\",\"started\":\"$(date -Iseconds)\",\"duration\":0,\"status\":\"in_progress\",\"attempts\":1}"
    
    # Use python/jq if available, otherwise just append
    if command -v jq &> /dev/null; then
        local updated
        updated=$(jq ".phases += [$phase_data]" "$temp_file")
        echo "$updated" > "$temp_file"
    fi
}

# Record phase completion
metrics_phase_complete() {
    local phase="$1"
    local status="$2"  # success, failed, timeout
    local duration="$3"
    local attempts="${4:-1}"
    local temp_file="/tmp/metrics_current_$$.json"
    
    if [ ! -f "$temp_file" ]; then
        return
    fi
    
    if command -v jq &> /dev/null; then
        local updated
        updated=$(jq "(.phases[] | select(.name == \"$phase\")) |= {
            name: \"$phase\",
            started: .started,
            duration: $duration,
            status: \"$status\",
            attempts: $attempts
        }" "$temp_file")
        echo "$updated" > "$temp_file"
    fi
}

# Record retry
metrics_record_retry() {
    local temp_file="/tmp/metrics_current_$$.json"
    
    if [ ! -f "$temp_file" ] || ! command -v jq &> /dev/null; then
        return
    fi
    
    local updated
    updated=$(jq '.retries += 1' "$temp_file")
    echo "$updated" > "$temp_file"
}

# Record validation result
metrics_record_validation() {
    local validation_type="$1"  # type_check, tests
    local result="$2"  # passed, failed
    local temp_file="/tmp/metrics_current_$$.json"
    
    if [ ! -f "$temp_file" ] || ! command -v jq &> /dev/null; then
        return
    fi
    
    local updated
    updated=$(jq ".validations.$validation_type = \"$result\"" "$temp_file")
    echo "$updated" > "$temp_file"
}

# Finalize metrics entry
metrics_finish() {
    local status="$1"  # success, failed
    local temp_file="/tmp/metrics_current_$$.json"
    
    if [ ! -f "$temp_file" ]; then
        return
    fi
    
    init_metrics
    
    # Count files changed
    local files_changed=$(git status --short | grep -v "^??" | wc -l)
    
    # Count tests added (rough estimate)
    local tests_added=0
    if git diff --cached --name-only | grep -q "__tests__/"; then
        tests_added=$(git diff --cached --unified=0 | grep -c "^\+.*it('\\|^\+.*test('")
    fi
    
    # Calculate total duration
    if command -v jq &> /dev/null; then
        local started
        started=$(jq -r '.started' "$temp_file")
        local now
        now=$(date -Iseconds)
        local start_epoch
        start_epoch=$(date -d "$started" +%s 2>/dev/null || echo 0)
        local end_epoch
        end_epoch=$(date -d "$now" +%s 2>/dev/null || echo 0)
        local total_duration=$((end_epoch - start_epoch))
        
        # Update temp file with final data
        local updated
        updated=$(jq "
            .ended = \"$now\" |
            .total_duration = $total_duration |
            .status = \"$status\" |
            .files_changed = $files_changed |
            .tests_added = $tests_added
        " "$temp_file")
        
        # Append to metrics file
        local all_metrics
        all_metrics=$(jq ".runs += [$updated]" "$METRICS_FILE")
        echo "$all_metrics" > "$METRICS_FILE"
    fi
    
    # Cleanup
    rm -f "$temp_file"
}

# Get metrics summary
metrics_summary() {
    if [ ! -f "$METRICS_FILE" ] || ! command -v jq &> /dev/null; then
        echo "Metrics not available (jq required)"
        return
    fi
    
    local total_runs
    total_runs=$(jq '.runs | length' "$METRICS_FILE")
    local successful_runs
    successful_runs=$(jq '[.runs[] | select(.status == "success")] | length' "$METRICS_FILE")
    local failed_runs
    failed_runs=$(jq '[.runs[] | select(.status == "failed")] | length' "$METRICS_FILE")
    
    local avg_duration=0
    if [ "$successful_runs" -gt 0 ]; then
        avg_duration=$(jq '[.runs[] | select(.status == "success") | .total_duration] | add / length | floor' "$METRICS_FILE")
    fi
    
    local total_files
    total_files=$(jq '[.runs[] | .files_changed] | add' "$METRICS_FILE")
    local total_tests
    total_tests=$(jq '[.runs[] | .tests_added] | add' "$METRICS_FILE")
    
    cat << EOF

╔══════════════════════════════════════════════╗
║         Orchestration Metrics                ║
╚══════════════════════════════════════════════╝

Total Runs:        $total_runs
Successful:        $successful_runs
Failed:            $failed_runs
Success Rate:      $(( successful_runs * 100 / (total_runs > 0 ? total_runs : 1) ))%

Avg Duration:      ${avg_duration}s ($(($avg_duration / 60))m $(($avg_duration % 60))s)
Total Files:       $total_files
Total Tests:       $total_tests

EOF
}

# Show recent runs
metrics_recent() {
    local count="${1:-5}"
    
    if [ ! -f "$METRICS_FILE" ] || ! command -v jq &> /dev/null; then
        echo "Metrics not available (jq required)"
        return
    fi
    
    echo ""
    echo "Recent Runs (last $count):"
    echo ""
    
    jq -r ".runs | .[-$count:] | .[] | 
        \"\(.started | split(\"T\")[0]) \(.workflow) - \(.task[0:40]) - \(.status) (\(.total_duration)s)\"" \
        "$METRICS_FILE" | nl
}

# Export metrics to CSV
metrics_export_csv() {
    local output_file="${1:-.copilot/metrics.csv}"
    
    if [ ! -f "$METRICS_FILE" ] || ! command -v jq &> /dev/null; then
        echo "Metrics not available (jq required)"
        return
    fi
    
    # Header
    echo "started,workflow,task,status,duration,files_changed,tests_added,retries" > "$output_file"
    
    # Data
    jq -r '.runs[] | 
        [.started, .workflow, .task, .status, .total_duration, .files_changed, .tests_added, .retries] | 
        @csv' "$METRICS_FILE" >> "$output_file"
    
    echo "Metrics exported to: $output_file"
}
