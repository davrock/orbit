#!/bin/bash
# Notification System for Orchestrator
# Supports multiple notification backends

# Send notification
notify() {
    local title="$1"
    local message="$2"
    local urgency="${3:-normal}"  # low, normal, critical
    
    # Check if notifications are enabled
    if [ "${NOTIFY_ENABLED:-false}" != "true" ]; then
        return 0
    fi
    
    # Determine notification method
    local method="${NOTIFY_METHOD:-auto}"
    
    case "$method" in
        auto)
            # Auto-detect available notification system
            if command -v notify-send &> /dev/null; then
                notify_desktop "$title" "$message" "$urgency"
            elif command -v osascript &> /dev/null; then
                notify_macos "$title" "$message"
            elif [ -n "$NOTIFY_CUSTOM_CMD" ]; then
                notify_custom "$title" "$message" "$urgency"
            fi
            ;;
        desktop)
            notify_desktop "$title" "$message" "$urgency"
            ;;
        macos)
            notify_macos "$title" "$message"
            ;;
        slack)
            notify_slack "$title" "$message" "$urgency"
            ;;
        custom)
            notify_custom "$title" "$message" "$urgency"
            ;;
    esac
}

# Desktop notification (Linux)
notify_desktop() {
    local title="$1"
    local message="$2"
    local urgency="$3"
    
    if ! command -v notify-send &> /dev/null; then
        return 1
    fi
    
    notify-send -u "$urgency" "$title" "$message"
}

# macOS notification
notify_macos() {
    local title="$1"
    local message="$2"
    
    if ! command -v osascript &> /dev/null; then
        return 1
    fi
    
    osascript -e "display notification \"$message\" with title \"$title\""
}

# Slack notification
notify_slack() {
    local title="$1"
    local message="$2"
    local urgency="$3"
    
    if [ -z "$SLACK_WEBHOOK_URL" ]; then
        echo "SLACK_WEBHOOK_URL not configured"
        return 1
    fi
    
    local color="good"
    [ "$urgency" = "critical" ] && color="danger"
    [ "$urgency" = "normal" ] && color="warning"
    
    local payload=$(cat << EOF
{
  "attachments": [{
    "color": "$color",
    "title": "$title",
    "text": "$message",
    "footer": "Copilot Orchestrator",
    "ts": $(date +%s)
  }]
}
EOF
)
    
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "$payload" \
        --silent --show-error
}

# Discord notification
notify_discord() {
    local title="$1"
    local message="$2"
    
    if [ -z "$DISCORD_WEBHOOK_URL" ]; then
        echo "DISCORD_WEBHOOK_URL not configured"
        return 1
    fi
    
    local payload=$(cat << EOF
{
  "embeds": [{
    "title": "$title",
    "description": "$message",
    "color": 3447003,
    "footer": {
      "text": "Copilot Orchestrator"
    },
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  }]
}
EOF
)
    
    curl -X POST "$DISCORD_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "$payload" \
        --silent --show-error
}

# Email notification
notify_email() {
    local title="$1"
    local message="$2"
    
    if [ -z "$NOTIFY_EMAIL" ]; then
        echo "NOTIFY_EMAIL not configured"
        return 1
    fi
    
    if command -v mail &> /dev/null; then
        echo "$message" | mail -s "$title" "$NOTIFY_EMAIL"
    elif command -v sendmail &> /dev/null; then
        (
            echo "Subject: $title"
            echo "To: $NOTIFY_EMAIL"
            echo ""
            echo "$message"
        ) | sendmail "$NOTIFY_EMAIL"
    else
        echo "No mail command available"
        return 1
    fi
}

# Custom notification command
notify_custom() {
    local title="$1"
    local message="$2"
    local urgency="$3"
    
    if [ -z "$NOTIFY_CUSTOM_CMD" ]; then
        return 1
    fi
    
    # Execute custom command with title and message as arguments
    eval "$NOTIFY_CUSTOM_CMD" "\"$title\"" "\"$message\"" "\"$urgency\""
}

# Notify on orchestration start
notify_start() {
    local task="$1"
    local workflow="$2"
    
    if [ "${NOTIFY_ON_START:-false}" = "true" ]; then
        notify "Orchestration Started" \
            "Task: $task\nWorkflow: $workflow" \
            "low"
    fi
}

# Notify on orchestration completion
notify_complete() {
    local task="$1"
    local duration="$2"
    
    if [ "${NOTIFY_ON_COMPLETE:-true}" = "true" ]; then
        notify "Orchestration Complete ✓" \
            "Task: $task\nDuration: ${duration}s ($(($duration / 60))m $(($duration % 60))s)" \
            "normal"
    fi
}

# Notify on orchestration failure
notify_failure() {
    local task="$1"
    local phase="$2"
    local reason="${3:-Unknown error}"
    
    if [ "${NOTIFY_ON_FAILURE:-true}" = "true" ]; then
        notify "Orchestration Failed ✗" \
            "Task: $task\nFailed at: $phase\nReason: $reason" \
            "critical"
    fi
}

# Notify on long-running phase
notify_long_running() {
    local phase="$1"
    local duration="$2"
    
    if [ "${NOTIFY_ON_LONG_RUNNING:-false}" = "true" ]; then
        notify "Phase Running Long" \
            "Phase: $phase\nRunning for: ${duration}s ($(($duration / 60))m)" \
            "low"
    fi
}

# Test notifications
test_notifications() {
    echo "Testing notification system..."
    echo ""
    
    echo "Detected systems:"
    command -v notify-send &> /dev/null && echo "  ✓ Desktop (Linux)"
    command -v osascript &> /dev/null && echo "  ✓ macOS"
    [ -n "$SLACK_WEBHOOK_URL" ] && echo "  ✓ Slack"
    [ -n "$DISCORD_WEBHOOK_URL" ] && echo "  ✓ Discord"
    [ -n "$NOTIFY_EMAIL" ] && echo "  ✓ Email"
    [ -n "$NOTIFY_CUSTOM_CMD" ] && echo "  ✓ Custom"
    
    echo ""
    echo "Sending test notification..."
    
    notify "Test Notification" \
        "If you see this, notifications are working!" \
        "normal"
    
    echo "Test notification sent"
    echo ""
    echo "If you didn't receive a notification, check:"
    echo "  1. NOTIFY_ENABLED=true in config"
    echo "  2. NOTIFY_METHOD is set correctly"
    echo "  3. Webhook URLs are configured (if using Slack/Discord)"
}
