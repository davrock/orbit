#!/bin/bash
# 🧠 ORBIT - Skill Learning System
# Extracts and stores reusable patterns from completed missions

set -e

SKILLS_DIR=".copilot/skills"
SKILLS_INDEX="$SKILLS_DIR/index.json"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

mkdir -p "$SKILLS_DIR"

# Initialize skills index
init_skills() {
    if [ ! -f "$SKILLS_INDEX" ]; then
        cat > "$SKILLS_INDEX" << 'EOF'
{
  "skills": [],
  "patterns": {},
  "success_rate": {},
  "last_updated": ""
}
EOF
    fi
}

# Extract skill from a completed mission
extract_skill() {
    local task="$1"
    local outcome="${2:-success}"
    local notes="${3:-}"
    
    init_skills
    
    # Generate skill ID
    local skill_id
    skill_id="skill-$(date +%Y%m%d-%H%M%S)"
    
    # Detect patterns in the task
    local patterns=""
    local category="general"
    
    # Categorize by keywords
    if echo "$task" | grep -qiE "test|spec|coverage"; then
        category="testing"
        patterns="testing,quality"
    elif echo "$task" | grep -qiE "security|auth|vuln"; then
        category="security"
        patterns="security,audit"
    elif echo "$task" | grep -qiE "api|endpoint|rest|graphql"; then
        category="api"
        patterns="api,integration"
    elif echo "$task" | grep -qiE "database|migration|schema"; then
        category="database"
        patterns="database,migration"
    elif echo "$task" | grep -qiE "refactor|clean|reorganize"; then
        category="refactoring"
        patterns="refactoring,cleanup"
    elif echo "$task" | grep -qiE "docs|readme|documentation"; then
        category="documentation"
        patterns="documentation,writing"
    elif echo "$task" | grep -qiE "performance|optimize|speed"; then
        category="performance"
        patterns="performance,optimization"
    elif echo "$task" | grep -qiE "bug|fix|error|issue"; then
        category="debugging"
        patterns="debugging,fix"
    elif echo "$task" | grep -qiE "feature|implement|add|create"; then
        category="feature"
        patterns="feature,implementation"
    fi
    
    # Create skill file
    local skill_file="$SKILLS_DIR/${skill_id}.json"
    cat > "$skill_file" << EOF
{
  "id": "$skill_id",
  "task": "$task",
  "category": "$category",
  "patterns": "$patterns",
  "outcome": "$outcome",
  "notes": "$notes",
  "created": "$(date -Iseconds)",
  "reuse_count": 0
}
EOF
    
    # Update index
    python3 -c "
import json
from datetime import datetime

with open('$SKILLS_INDEX', 'r') as f:
    data = json.load(f)

# Add to skills list
data['skills'].append('$skill_id')

# Update pattern counts
for p in '$patterns'.split(','):
    if p:
        data['patterns'][p] = data['patterns'].get(p, 0) + 1

# Update success rate
cat = '$category'
if cat not in data['success_rate']:
    data['success_rate'][cat] = {'success': 0, 'total': 0}
data['success_rate'][cat]['total'] += 1
if '$outcome' == 'success':
    data['success_rate'][cat]['success'] += 1

data['last_updated'] = datetime.now().isoformat()

with open('$SKILLS_INDEX', 'w') as f:
    json.dump(data, f, indent=2)
" 2>/dev/null
    
    echo -e "${GREEN}✓ Skill extracted: $skill_id${NC}"
    echo -e "  Category: $category"
    echo -e "  Patterns: $patterns"
}

# Find similar skills for a new task
find_similar() {
    local task="$1"
    local limit="${2:-5}"
    
    init_skills
    
    echo -e "${CYAN}🔍 Finding similar skills for: $task${NC}"
    echo ""
    
    # Simple keyword matching
    local task_lower
    task_lower=$(echo "$task" | tr '[:upper:]' '[:lower:]')
    
    # Extract keywords
    local keywords
    keywords=$(echo "$task_lower" | tr ' ' '\n' | grep -E '^[a-z]{4,}$' | head -10 | tr '\n' '|')
    
    if [ -z "$keywords" ]; then
        echo "No matching skills found."
        return
    fi
    
    # Remove trailing pipe
    keywords="${keywords%|}"
    
    local found=0
    for skill_file in "$SKILLS_DIR"/skill-*.json; do
        [ ! -f "$skill_file" ] && continue
        
        local skill_task
        skill_task=$(python3 -c "import json; print(json.load(open('$skill_file')).get('task',''))" 2>/dev/null)
        
        if echo "$skill_task" | grep -qiE "$keywords"; then
            found=$((found + 1))
            local skill_id category outcome
            skill_id=$(basename "$skill_file" .json)
            category=$(python3 -c "import json; print(json.load(open('$skill_file')).get('category',''))" 2>/dev/null)
            outcome=$(python3 -c "import json; print(json.load(open('$skill_file')).get('outcome',''))" 2>/dev/null)
            
            local outcome_icon="✓"
            [ "$outcome" != "success" ] && outcome_icon="✗"
            
            echo -e "  $outcome_icon $skill_id [$category]"
            echo -e "    ${YELLOW}${skill_task:0:60}...${NC}"
            echo ""
            
            [ "$found" -ge "$limit" ] && break
        fi
    done
    
    if [ "$found" -eq 0 ]; then
        echo "No matching skills found."
    else
        echo -e "${GREEN}Found $found similar skill(s)${NC}"
    fi
}

# List all skills
list_skills() {
    init_skills
    
    echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║  🧠 ORBIT - Skill Library                                    ║${NC}"
    echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    local total
    total=$(find "$SKILLS_DIR" -name "skill-*.json" 2>/dev/null | wc -l)
    
    if [ "$total" -eq 0 ]; then
        echo "No skills learned yet. Complete missions to build your skill library."
        return
    fi
    
    echo -e "Total skills: ${CYAN}$total${NC}"
    echo ""
    
    # Show by category
    echo -e "${CYAN}By Category:${NC}"
    python3 -c "
import json
import os

skills_dir = '$SKILLS_DIR'
categories = {}

for f in os.listdir(skills_dir):
    if f.startswith('skill-') and f.endswith('.json'):
        try:
            with open(os.path.join(skills_dir, f)) as sf:
                data = json.load(sf)
                cat = data.get('category', 'general')
                categories[cat] = categories.get(cat, 0) + 1
        except:
            pass

for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
    print(f'  {cat}: {count}')
" 2>/dev/null
    
    echo ""
    
    # Show success rates
    if [ -f "$SKILLS_INDEX" ]; then
        echo -e "${CYAN}Success Rates:${NC}"
        python3 -c "
import json

with open('$SKILLS_INDEX') as f:
    data = json.load(f)

for cat, stats in data.get('success_rate', {}).items():
    total = stats.get('total', 0)
    success = stats.get('success', 0)
    rate = (success / total * 100) if total > 0 else 0
    print(f'  {cat}: {rate:.0f}% ({success}/{total})')
" 2>/dev/null
    fi
}

# Show skill details
show_skill() {
    local skill_id="$1"
    local skill_file="$SKILLS_DIR/${skill_id}.json"
    
    if [ ! -f "$skill_file" ]; then
        echo -e "${YELLOW}Skill not found: $skill_id${NC}"
        return 1
    fi
    
    python3 -c "
import json

with open('$skill_file') as f:
    s = json.load(f)

print(f\"🧠 Skill: {s['id']}\")
print(f\"Task: {s['task']}\")
print(f\"Category: {s['category']}\")
print(f\"Patterns: {s['patterns']}\")
print(f\"Outcome: {s['outcome']}\")
print(f\"Created: {s['created']}\")
if s.get('notes'):
    print(f\"Notes: {s['notes']}\")
print(f\"Reuse count: {s.get('reuse_count', 0)}\")
" 2>/dev/null
}

# Mark skill as reused
mark_reused() {
    local skill_id="$1"
    local skill_file="$SKILLS_DIR/${skill_id}.json"
    
    if [ ! -f "$skill_file" ]; then
        return 1
    fi
    
    python3 -c "
import json

with open('$skill_file', 'r') as f:
    s = json.load(f)

s['reuse_count'] = s.get('reuse_count', 0) + 1

with open('$skill_file', 'w') as f:
    json.dump(s, f, indent=2)
" 2>/dev/null
}

# Get recommendations for a task
recommend() {
    local task="$1"
    
    echo -e "${CYAN}🎯 Recommendations for: $task${NC}"
    echo ""
    
    # Find similar tasks
    find_similar "$task" 3
    
    echo ""
    
    # Suggest based on patterns
    echo -e "${CYAN}Suggested approach based on patterns:${NC}"
    
    if echo "$task" | grep -qiE "test"; then
        echo "  • Use TDD: Write tests first"
        echo "  • Cover edge cases"
        echo "  • Use the 'preflight' mission"
    elif echo "$task" | grep -qiE "security"; then
        echo "  • Use 'shields-up' mission for security focus"
        echo "  • Check OWASP Top 10"
        echo "  • Use premium model tier"
    elif echo "$task" | grep -qiE "api"; then
        echo "  • Use 'dock' mission for API development"
        echo "  • Document endpoints"
        echo "  • Add integration tests"
    elif echo "$task" | grep -qiE "bug|fix"; then
        echo "  • Use 'repair' mission for bug fixes"
        echo "  • Reproduce before fixing"
        echo "  • Add regression test"
    else
        echo "  • Use 'launch' for standard feature development"
        echo "  • Start with planning phase"
        echo "  • Write tests alongside implementation"
    fi
}

# Help
show_help() {
    cat << 'EOF'
🧠 ORBIT Skill Learning System

Usage: ./.copilot/skills.sh <command> [args]

COMMANDS:
  extract "task" [outcome] [notes]   Record a skill from completed task
  find "task"                        Find similar skills
  list                               List all skills
  show <skill-id>                    Show skill details
  recommend "task"                   Get recommendations
  reused <skill-id>                  Mark skill as reused
  
EXAMPLES:
  ./.copilot/skills.sh extract "Add user authentication" success "Used JWT"
  ./.copilot/skills.sh find "implement login"
  ./.copilot/skills.sh recommend "add password reset"
  
The skill library grows as you complete missions, helping future tasks.
EOF
}

# Main
case "${1:-}" in
    extract) extract_skill "$2" "${3:-success}" "${4:-}" ;;
    find) find_similar "$2" ;;
    list) list_skills ;;
    show) show_skill "$2" ;;
    recommend) recommend "$2" ;;
    reused) mark_reused "$2" ;;
    init) init_skills && echo "Skills initialized" ;;
    -h|--help|help) show_help ;;
    "") list_skills ;;
    *) echo "Unknown command: $1"; show_help; exit 1 ;;
esac
