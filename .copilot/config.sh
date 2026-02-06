#!/bin/bash
# Copilot Orchestration Configuration
# Edit this file to customize behavior for your project

# Project Information
PROJECT_NAME="${PROJECT_NAME:-MyProject}"
PROJECT_DESCRIPTION="Software development project"

# Quality Gate Commands (customize for your tech stack)
TYPE_CHECK_CMD="${TYPE_CHECK_CMD:-npx tsc --noEmit}"
TEST_CMD="${TEST_CMD:-npm test}"
LINT_CMD="${LINT_CMD:-npm run lint}"  # Optional
FORMAT_CMD="${FORMAT_CMD:-}"  # Optional (e.g., "npm run format")

# Phase Timeouts (seconds)
# Set to 0 to disable timeout for a phase
TIMEOUT_PLAN=600        # 10 minutes
TIMEOUT_IMPLEMENT=1800  # 30 minutes
TIMEOUT_TEST=900        # 15 minutes
TIMEOUT_REVIEW=300      # 5 minutes
TIMEOUT_DEBUG=600       # 10 minutes
TIMEOUT_COMMIT=180      # 3 minutes

# Retry Configuration
MAX_RETRIES=2

# Git Configuration
GIT_BRANCH="development"  # Branch to commit/push to
GIT_AUTO_PUSH=true        # Auto-push after commit

# Quality Gates
REQUIRE_TYPE_CHECK=true   # Fail if type check fails
REQUIRE_TESTS_PASS=true   # Fail if tests fail
REQUIRE_LINT_PASS=false   # Fail if lint fails (set to true to enforce)

# Validation Settings
VALIDATE_FILES_CHANGED=true  # Check that implementer actually changed files
MIN_FILES_CHANGED=1          # Minimum files that should be changed

# Logging
LOG_VERBOSE=false  # Extra detailed logging
LOG_TIMESTAMPS=true

# Notifications (not yet implemented)
NOTIFY_ON_COMPLETE=false
NOTIFY_ON_FAILURE=false
NOTIFY_CMD=""  # e.g., "notify-send" or custom script

# Examples for Different Tech Stacks:

# Python/Django:
# TYPE_CHECK_CMD="mypy src/"
# TEST_CMD="pytest tests/"
# LINT_CMD="pylint src/"

# Go:
# TYPE_CHECK_CMD="go vet ./..."
# TEST_CMD="go test ./..."
# LINT_CMD="golangci-lint run"

# Java/Maven:
# TYPE_CHECK_CMD="./mvnw compile"
# TEST_CMD="./mvnw test"
# LINT_CMD="./mvnw checkstyle:check"

# Ruby/Rails:
# TYPE_CHECK_CMD="bundle exec rubocop"
# TEST_CMD="bundle exec rspec"
# LINT_CMD="bundle exec rubocop"
