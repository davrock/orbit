#!/bin/bash
# 🛸 ORBIT Auto-Configuration
# Zero-config setup - everything is auto-detected!

#═══════════════════════════════════════════════════════════════════════════════
# AUTO-DETECTION ENGINE
#═══════════════════════════════════════════════════════════════════════════════

detect_project_name() {
    # Priority: package.json name > Cargo.toml name > pom.xml > go.mod > directory name
    if [[ -f "package.json" ]]; then
        name=$(grep -m1 '"name"' package.json 2>/dev/null | sed 's/.*"name".*"\([^"]*\)".*/\1/')
        [[ -n "$name" ]] && echo "$name" && return
    fi
    if [[ -f "Cargo.toml" ]]; then
        name=$(grep -m1 '^name' Cargo.toml 2>/dev/null | sed 's/name.*=.*"\([^"]*\)".*/\1/')
        [[ -n "$name" ]] && echo "$name" && return
    fi
    if [[ -f "pom.xml" ]]; then
        name=$(grep -m1 '<artifactId>' pom.xml 2>/dev/null | sed 's/.*<artifactId>\([^<]*\)<.*/\1/')
        [[ -n "$name" ]] && echo "$name" && return
    fi
    if [[ -f "go.mod" ]]; then
        name=$(head -1 go.mod 2>/dev/null | sed 's/module //' | xargs basename)
        [[ -n "$name" ]] && echo "$name" && return
    fi
    if [[ -f "pyproject.toml" ]]; then
        name=$(grep -m1 'name' pyproject.toml 2>/dev/null | sed 's/name.*=.*"\([^"]*\)".*/\1/')
        [[ -n "$name" ]] && echo "$name" && return
    fi
    basename "$(pwd)"
}

detect_tech_stack() {
    # Returns: node|python|go|rust|java|ruby|dotnet|php|unknown
    [[ -f "package.json" ]] && echo "node" && return
    [[ -f "requirements.txt" || -f "pyproject.toml" || -f "setup.py" || -f "Pipfile" ]] && echo "python" && return
    [[ -f "go.mod" ]] && echo "go" && return
    [[ -f "Cargo.toml" ]] && echo "rust" && return
    [[ -f "pom.xml" || -f "build.gradle" || -f "build.gradle.kts" ]] && echo "java" && return
    [[ -f "Gemfile" ]] && echo "ruby" && return
    [[ -f "*.csproj" || -f "*.sln" ]] && echo "dotnet" && return
    [[ -f "composer.json" ]] && echo "php" && return
    echo "unknown"
}

detect_type_check_cmd() {
    local stack=$(detect_tech_stack)
    case "$stack" in
        node)
            [[ -f "tsconfig.json" ]] && echo "npx tsc --noEmit" && return
            echo ""
            ;;
        python)
            command -v mypy &>/dev/null && echo "mypy ." && return
            command -v pyright &>/dev/null && echo "pyright" && return
            echo ""
            ;;
        go) echo "go vet ./..." ;;
        rust) echo "cargo check" ;;
        java)
            [[ -f "pom.xml" ]] && echo "./mvnw compile -q" && return
            [[ -f "build.gradle" || -f "build.gradle.kts" ]] && echo "./gradlew compileJava -q" && return
            echo ""
            ;;
        ruby) echo "" ;;
        dotnet) echo "dotnet build --no-restore -v q" ;;
        php) echo "" ;;
        *) echo "" ;;
    esac
}

detect_test_cmd() {
    local stack=$(detect_tech_stack)
    case "$stack" in
        node)
            [[ -f "package.json" ]] && grep -q '"test"' package.json && echo "npm test" && return
            [[ -f "jest.config.js" || -f "jest.config.ts" ]] && echo "npx jest" && return
            [[ -f "vitest.config.js" || -f "vitest.config.ts" ]] && echo "npx vitest run" && return
            echo "npm test"
            ;;
        python)
            [[ -f "pytest.ini" || -d "tests" ]] && echo "pytest" && return
            echo "python -m pytest"
            ;;
        go) echo "go test ./..." ;;
        rust) echo "cargo test" ;;
        java)
            [[ -f "pom.xml" ]] && echo "./mvnw test -q" && return
            [[ -f "build.gradle" || -f "build.gradle.kts" ]] && echo "./gradlew test -q" && return
            echo ""
            ;;
        ruby) echo "bundle exec rspec" ;;
        dotnet) echo "dotnet test --no-build -v q" ;;
        php) echo "vendor/bin/phpunit" ;;
        *) echo "" ;;
    esac
}

detect_lint_cmd() {
    local stack=$(detect_tech_stack)
    case "$stack" in
        node)
            [[ -f ".eslintrc.js" || -f ".eslintrc.json" || -f "eslint.config.js" ]] && echo "npx eslint ." && return
            [[ -f "package.json" ]] && grep -q '"lint"' package.json && echo "npm run lint" && return
            echo ""
            ;;
        python)
            command -v ruff &>/dev/null && echo "ruff check ." && return
            command -v flake8 &>/dev/null && echo "flake8" && return
            command -v pylint &>/dev/null && echo "pylint **/*.py" && return
            echo ""
            ;;
        go) echo "golangci-lint run 2>/dev/null || go vet ./..." ;;
        rust) echo "cargo clippy" ;;
        java) echo "" ;;
        ruby) echo "bundle exec rubocop" ;;
        dotnet) echo "" ;;
        php) echo "vendor/bin/phpcs" ;;
        *) echo "" ;;
    esac
}

detect_git_branch() {
    # Priority: current branch > main > master > development
    local current=$(git branch --show-current 2>/dev/null)
    [[ -n "$current" ]] && echo "$current" && return
    git rev-parse --verify main &>/dev/null && echo "main" && return
    git rev-parse --verify master &>/dev/null && echo "master" && return
    git rev-parse --verify development &>/dev/null && echo "development" && return
    echo "main"
}

detect_package_manager() {
    local stack=$(detect_tech_stack)
    case "$stack" in
        node)
            [[ -f "pnpm-lock.yaml" ]] && echo "pnpm" && return
            [[ -f "yarn.lock" ]] && echo "yarn" && return
            [[ -f "bun.lockb" ]] && echo "bun" && return
            echo "npm"
            ;;
        python)
            [[ -f "poetry.lock" ]] && echo "poetry" && return
            [[ -f "Pipfile.lock" ]] && echo "pipenv" && return
            echo "pip"
            ;;
        *) echo "" ;;
    esac
}

#═══════════════════════════════════════════════════════════════════════════════
# AUTO-DETECTED VALUES (override with environment variables if needed)
#═══════════════════════════════════════════════════════════════════════════════

PROJECT_NAME="${PROJECT_NAME:-$(detect_project_name)}"
TECH_STACK="${TECH_STACK:-$(detect_tech_stack)}"
PACKAGE_MANAGER="${PACKAGE_MANAGER:-$(detect_package_manager)}"

TYPE_CHECK_CMD="${TYPE_CHECK_CMD:-$(detect_type_check_cmd)}"
TEST_CMD="${TEST_CMD:-$(detect_test_cmd)}"
LINT_CMD="${LINT_CMD:-$(detect_lint_cmd)}"
FORMAT_CMD="${FORMAT_CMD:-}"

GIT_BRANCH="${GIT_BRANCH:-$(detect_git_branch)}"
GIT_AUTO_PUSH="${GIT_AUTO_PUSH:-true}"

#═══════════════════════════════════════════════════════════════════════════════
# STATIC DEFAULTS (rarely need changing)
#═══════════════════════════════════════════════════════════════════════════════

# Timeouts (seconds)
TIMEOUT_DEFAULT="${TIMEOUT_DEFAULT:-600}"
TIMEOUT_PLAN="${TIMEOUT_PLAN:-600}"
TIMEOUT_IMPLEMENT="${TIMEOUT_IMPLEMENT:-1800}"
TIMEOUT_TEST="${TIMEOUT_TEST:-900}"
TIMEOUT_REVIEW="${TIMEOUT_REVIEW:-300}"
TIMEOUT_DEBUG="${TIMEOUT_DEBUG:-600}"
TIMEOUT_COMMIT="${TIMEOUT_COMMIT:-180}"

# Retry & Quality
MAX_RETRIES="${MAX_RETRIES:-2}"
REQUIRE_TYPE_CHECK="${REQUIRE_TYPE_CHECK:-true}"
REQUIRE_TESTS_PASS="${REQUIRE_TESTS_PASS:-true}"
REQUIRE_LINT_PASS="${REQUIRE_LINT_PASS:-false}"

# Validation
VALIDATE_FILES_CHANGED="${VALIDATE_FILES_CHANGED:-true}"
MIN_FILES_CHANGED="${MIN_FILES_CHANGED:-1}"

# Logging & Notifications
LOG_VERBOSE="${LOG_VERBOSE:-false}"
LOG_TIMESTAMPS="${LOG_TIMESTAMPS:-true}"
NOTIFY_ON_COMPLETE="${NOTIFY_ON_COMPLETE:-false}"
NOTIFY_ON_FAILURE="${NOTIFY_ON_FAILURE:-false}"

# Model Selection
MODEL_TIER="${MODEL_TIER:-auto}"

#═══════════════════════════════════════════════════════════════════════════════
# DEBUG: Show detected values (uncomment to debug)
#═══════════════════════════════════════════════════════════════════════════════
# echo "🔍 Auto-detected configuration:"
# echo "   Project: $PROJECT_NAME"
# echo "   Stack:   $TECH_STACK"
# echo "   Package: $PACKAGE_MANAGER"
# echo "   Branch:  $GIT_BRANCH"
# echo "   Type:    $TYPE_CHECK_CMD"
# echo "   Test:    $TEST_CMD"
# echo "   Lint:    $LINT_CMD"
