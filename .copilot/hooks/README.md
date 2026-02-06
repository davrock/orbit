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
