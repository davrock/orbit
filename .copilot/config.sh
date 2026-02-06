#!/bin/bash
# 🛸 ORBIT Auto-Configuration
# Zero-config setup - everything is auto-detected!

#═══════════════════════════════════════════════════════════════════════════════
# AUTO-DETECTION ENGINE
#═══════════════════════════════════════════════════════════════════════════════

detect_project_name() {
    # Priority: package.json > app.json > Cargo.toml > pom.xml > build.gradle > 
    #           gradle.properties > go.mod > pyproject.toml > setup.py > composer.json > 
    #           *.csproj > CMakeLists.txt > .git remote > directory name
    
    # Node.js / JavaScript
    if [[ -f "package.json" ]]; then
        name=$(grep -m1 '"name"' package.json 2>/dev/null | sed 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
        [[ -n "$name" && "$name" != "name" ]] && echo "$name" && return
    fi
    
    # React Native / Expo
    if [[ -f "app.json" ]]; then
        name=$(grep -m1 '"name"' app.json 2>/dev/null | sed 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
        [[ -n "$name" && "$name" != "name" ]] && echo "$name" && return
    fi
    
    # Expo config
    if [[ -f "app.config.js" || -f "app.config.ts" ]]; then
        name=$(grep -m1 'name:' app.config.* 2>/dev/null | sed "s/.*name:[[:space:]]*['\"]\\([^'\"]*\\)['\"].*/\\1/")
        [[ -n "$name" && "$name" != "name" ]] && echo "$name" && return
    fi
    
    # Rust
    if [[ -f "Cargo.toml" ]]; then
        name=$(grep -m1 '^name' Cargo.toml 2>/dev/null | sed 's/name[[:space:]]*=[[:space:]]*"\([^"]*\)".*/\1/')
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # Java - Maven
    if [[ -f "pom.xml" ]]; then
        name=$(grep -m1 '<artifactId>' pom.xml 2>/dev/null | sed 's/.*<artifactId>\([^<]*\)<.*/\1/')
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # Java/Kotlin - Gradle (build.gradle or build.gradle.kts)
    if [[ -f "build.gradle" ]]; then
        name=$(grep -m1 "rootProject.name" build.gradle 2>/dev/null | sed "s/.*=[[:space:]]*['\"]\\([^'\"]*\\)['\"].*/\\1/")
        [[ -n "$name" ]] && echo "$name" && return
        name=$(grep -m1 "archivesBaseName" build.gradle 2>/dev/null | sed "s/.*=[[:space:]]*['\"]\\([^'\"]*\\)['\"].*/\\1/")
        [[ -n "$name" ]] && echo "$name" && return
    fi
    if [[ -f "build.gradle.kts" ]]; then
        name=$(grep -m1 "rootProject.name" build.gradle.kts 2>/dev/null | sed "s/.*=[[:space:]]*['\"]\\([^'\"]*\\)['\"].*/\\1/")
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # Java/Kotlin/Android - settings.gradle
    if [[ -f "settings.gradle" ]]; then
        name=$(grep -m1 "rootProject.name" settings.gradle 2>/dev/null | sed "s/.*=[[:space:]]*['\"]\\([^'\"]*\\)['\"].*/\\1/")
        [[ -n "$name" ]] && echo "$name" && return
    fi
    if [[ -f "settings.gradle.kts" ]]; then
        name=$(grep -m1 "rootProject.name" settings.gradle.kts 2>/dev/null | sed "s/.*=[[:space:]]*['\"]\\([^'\"]*\\)['\"].*/\\1/")
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # Android - gradle.properties
    if [[ -f "gradle.properties" ]]; then
        name=$(grep -m1 "^APP_NAME=" gradle.properties 2>/dev/null | cut -d= -f2)
        [[ -n "$name" ]] && echo "$name" && return
        name=$(grep -m1 "^PROJECT_NAME=" gradle.properties 2>/dev/null | cut -d= -f2)
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # Go
    if [[ -f "go.mod" ]]; then
        name=$(head -1 go.mod 2>/dev/null | sed 's/module //' | xargs basename 2>/dev/null)
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # Python - pyproject.toml
    if [[ -f "pyproject.toml" ]]; then
        name=$(grep -m1 '^name' pyproject.toml 2>/dev/null | sed 's/name[[:space:]]*=[[:space:]]*"\([^"]*\)".*/\1/')
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # Python - setup.py
    if [[ -f "setup.py" ]]; then
        name=$(grep -m1 "name=" setup.py 2>/dev/null | sed "s/.*name=['\"]\\([^'\"]*\\)['\"].*/\\1/")
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # PHP - composer.json
    if [[ -f "composer.json" ]]; then
        name=$(grep -m1 '"name"' composer.json 2>/dev/null | sed 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' | cut -d/ -f2)
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # .NET - *.csproj
    if compgen -G "*.csproj" > /dev/null 2>&1; then
        name=$(find . -maxdepth 1 -name "*.csproj" 2>/dev/null | head -1 | sed 's|^\./||; s/\.csproj$//')
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # .NET - *.sln
    if compgen -G "*.sln" > /dev/null 2>&1; then
        name=$(find . -maxdepth 1 -name "*.sln" 2>/dev/null | head -1 | sed 's|^\./||; s/\.sln$//')
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # C/C++ - CMakeLists.txt
    if [[ -f "CMakeLists.txt" ]]; then
        name=$(grep -m1 "project(" CMakeLists.txt 2>/dev/null | sed 's/project(\([^ )]*\).*/\1/')
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # C/C++ - Makefile (look for PROJECT_NAME)
    if [[ -f "Makefile" ]]; then
        name=$(grep -m1 "^PROJECT_NAME" Makefile 2>/dev/null | cut -d= -f2 | tr -d ' ')
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # Ruby - *.gemspec
    if compgen -G "*.gemspec" > /dev/null 2>&1; then
        name=$(find . -maxdepth 1 -name "*.gemspec" 2>/dev/null | head -1 | sed 's|^\./||; s/\.gemspec$//')
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # Elixir - mix.exs
    if [[ -f "mix.exs" ]]; then
        name=$(grep -m1 "app:" mix.exs 2>/dev/null | sed 's/.*app:[[:space:]]*:\([^,]*\).*/\1/')
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # Swift - Package.swift
    if [[ -f "Package.swift" ]]; then
        name=$(grep -m1 'name:' Package.swift 2>/dev/null | sed 's/.*name:[[:space:]]*"\([^"]*\)".*/\1/')
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # iOS - *.xcodeproj
    if compgen -G "*.xcodeproj" > /dev/null 2>&1; then
        name=$(find . -maxdepth 1 -type d -name "*.xcodeproj" 2>/dev/null | head -1 | sed 's|^\./||; s/\.xcodeproj$//')
        [[ -n "$name" ]] && echo "$name" && return
    fi
    
    # Git remote origin (last resort before directory name)
    if git rev-parse --git-dir &>/dev/null; then
        name=$(git remote get-url origin 2>/dev/null | sed 's/.*\/\([^\/]*\)\.git$/\1/' | sed 's/.*\/\([^\/]*\)$/\1/')
        [[ -n "$name" && "$name" != "origin" ]] && echo "$name" && return
    fi
    
    # Fallback: directory name
    basename "$(pwd)"
}

detect_tech_stack() {
    # Returns primary tech stack with detailed detection
    # Priority: Most specific indicators first
    
    # React Native / Expo (check before generic node)
    if [[ -f "app.json" || -f "app.config.js" || -f "app.config.ts" ]]; then
        if [[ -f "package.json" ]] && grep -q '"expo"' package.json 2>/dev/null; then
            echo "expo" && return
        fi
        if [[ -f "package.json" ]] && grep -q '"react-native"' package.json 2>/dev/null; then
            echo "react-native" && return
        fi
    fi
    
    # Node.js / JavaScript / TypeScript
    if [[ -f "package.json" ]]; then
        if [[ -f "next.config.js" || -f "next.config.mjs" || -f "next.config.ts" ]]; then
            echo "nextjs" && return
        fi
        if [[ -f "nuxt.config.js" || -f "nuxt.config.ts" ]]; then
            echo "nuxt" && return
        fi
        if [[ -f "svelte.config.js" ]]; then
            echo "svelte" && return
        fi
        if [[ -f "angular.json" ]]; then
            echo "angular" && return
        fi
        if [[ -f "vue.config.js" ]] || grep -q '"vue"' package.json 2>/dev/null; then
            echo "vue" && return
        fi
        if grep -q '"react"' package.json 2>/dev/null; then
            echo "react" && return
        fi
        if [[ -f "tsconfig.json" ]]; then
            echo "typescript" && return
        fi
        echo "node" && return
    fi
    
    # Python frameworks
    if [[ -f "requirements.txt" || -f "pyproject.toml" || -f "setup.py" || -f "Pipfile" ]]; then
        if [[ -f "manage.py" ]] || grep -qE "django" requirements.txt pyproject.toml 2>/dev/null; then
            echo "django" && return
        fi
        if grep -qE "fastapi" requirements.txt pyproject.toml 2>/dev/null; then
            echo "fastapi" && return
        fi
        if grep -qE "flask" requirements.txt pyproject.toml 2>/dev/null; then
            echo "flask" && return
        fi
        echo "python" && return
    fi
    
    # Go
    [[ -f "go.mod" ]] && echo "go" && return
    
    # Rust
    [[ -f "Cargo.toml" ]] && echo "rust" && return
    
    # Java / Kotlin / Android
    if [[ -f "pom.xml" ]]; then
        if grep -q "spring" pom.xml 2>/dev/null; then
            echo "spring" && return
        fi
        echo "maven" && return
    fi
    if [[ -f "build.gradle" || -f "build.gradle.kts" ]]; then
        if [[ -d "android" ]] || grep -q "android" build.gradle* 2>/dev/null; then
            echo "android" && return
        fi
        if grep -q "kotlin" build.gradle* 2>/dev/null; then
            echo "kotlin" && return
        fi
        echo "gradle" && return
    fi
    
    # Ruby
    if [[ -f "Gemfile" ]]; then
        if [[ -f "config/application.rb" ]] || grep -q "rails" Gemfile 2>/dev/null; then
            echo "rails" && return
        fi
        echo "ruby" && return
    fi
    
    # .NET
    if compgen -G "*.csproj" > /dev/null 2>&1 || compgen -G "*.sln" > /dev/null 2>&1; then
        if compgen -G "*.fsproj" > /dev/null 2>&1; then
            echo "fsharp" && return
        fi
        echo "dotnet" && return
    fi
    
    # PHP
    if [[ -f "composer.json" ]]; then
        if grep -q "laravel" composer.json 2>/dev/null; then
            echo "laravel" && return
        fi
        if grep -q "symfony" composer.json 2>/dev/null; then
            echo "symfony" && return
        fi
        echo "php" && return
    fi
    
    # C/C++
    [[ -f "CMakeLists.txt" ]] && echo "cmake" && return
    [[ -f "Makefile" ]] && compgen -G "*.c" > /dev/null 2>&1 && echo "c" && return
    [[ -f "Makefile" ]] && compgen -G "*.cpp" > /dev/null 2>&1 && echo "cpp" && return
    
    # Elixir
    [[ -f "mix.exs" ]] && echo "elixir" && return
    
    # Swift
    [[ -f "Package.swift" ]] && echo "swift" && return
    compgen -G "*.xcodeproj" > /dev/null 2>&1 && echo "ios" && return
    
    # Terraform / IaC
    compgen -G "*.tf" > /dev/null 2>&1 && echo "terraform" && return
    
    # Docker-only projects
    [[ -f "Dockerfile" && ! -f "package.json" && ! -f "requirements.txt" ]] && echo "docker" && return
    
    echo "unknown"
}

detect_type_check_cmd() {
    local stack
    stack=$(detect_tech_stack)
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
    local stack
    stack=$(detect_tech_stack)
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
    local stack
    stack=$(detect_tech_stack)
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
    local current
    current=$(git branch --show-current 2>/dev/null)
    [[ -n "$current" ]] && echo "$current" && return
    git rev-parse --verify main &>/dev/null && echo "main" && return
    git rev-parse --verify master &>/dev/null && echo "master" && return
    git rev-parse --verify development &>/dev/null && echo "development" && return
    echo "main"
}

detect_package_manager() {
    local stack
    stack=$(detect_tech_stack)
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
