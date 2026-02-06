// Mission data
const missions = {
    launch: {
        phases: 'plan → implement → test → review → commit',
        description: 'Full feature development workflow',
        output: [
            '🚀 Mission: launch | Task: {task}',
            '📋 Phase: plan (mission-planner, ⚡ standard)',
            '   Creating implementation plan...',
            '   ✓ Task breakdown complete',
            '⚙️  Phase: implement (pilot, ⚡ standard)',
            '   Implementing feature...',
            '   ✓ Implementation complete',
            '🧪 Phase: test (specialist, ⚡ standard)',
            '   Running tests...',
            '   ✓ All tests passing',
            '👁️  Phase: review (navigator, ⚡ standard)',
            '   Code review in progress...',
            '   ✓ Review approved',
            '📝 Phase: commit (pilot, ⚡ standard)',
            '   ✓ Changes committed',
            '✅ Mission complete! 🎉'
        ]
    },
    repair: {
        phases: 'debug → implement → test → commit',
        description: 'Bug fix with root cause analysis',
        output: [
            '🔧 Mission: repair | Task: {task}',
            '🔍 Phase: debug (engineer, 🔥 premium)',
            '   Analyzing issue...',
            '   Root cause identified',
            '⚙️  Phase: implement (pilot, ⚡ standard)',
            '   Implementing fix...',
            '   ✓ Fix complete',
            '🧪 Phase: test (specialist, ⚡ standard)',
            '   Running regression tests...',
            '   ✓ Issue resolved',
            '📝 Phase: commit (pilot, ⚡ standard)',
            '   ✓ Fix committed',
            '✅ Bug fixed! 🐛→✨'
        ]
    },
    warp: {
        phases: 'implement → commit',
        description: 'Quick change without extensive planning',
        output: [
            '⚡ Mission: warp | Task: {task}',
            '⚙️  Phase: implement (pilot, ⚡ standard)',
            '   Making quick changes...',
            '   ✓ Changes complete',
            '📝 Phase: commit (pilot, ⚡ standard)',
            '   ✓ Committed',
            '✅ Quick change complete! ⚡'
        ]
    },
    'shields-up': {
        phases: 'plan → implement → security → test → review → commit',
        description: 'Security-focused development',
        output: [
            '🛡️  Mission: shields-up | Task: {task}',
            '📋 Phase: plan (mission-planner, 🔥 premium)',
            '   Planning secure implementation...',
            '⚙️  Phase: implement (pilot, ⚡ standard)',
            '   Implementing with security best practices...',
            '🔐 Phase: security (security-officer, 🔥 premium)',
            '   OWASP Top 10 checks...',
            '   ✓ Security audit passed',
            '🧪 Phase: test (specialist, ⚡ standard)',
            '   Testing security scenarios...',
            '   ✓ All security tests passing',
            '👁️  Phase: review (navigator, ⚡ standard)',
            '   Final review...',
            '   ✓ Approved',
            '✅ Secure implementation complete! 🔒'
        ]
    },
    ralph: {
        phases: 'implement → test → review → commit (with retry)',
        description: 'Persistent mode with automatic retries',
        output: [
            '🔄 Mission: ralph | Task: {task}',
            '⚙️  Phase: implement (pilot, ⚡ standard) [Attempt 1]',
            '   Implementing feature...',
            '   ✓ Implementation complete',
            '🧪 Phase: test (specialist, ⚡ standard)',
            '   Running tests...',
            '   ✓ Tests passing',
            '👁️  Phase: review (navigator, ⚡ standard)',
            '   Code review...',
            '   ✓ Review approved',
            '📝 Phase: commit (pilot, ⚡ standard)',
            '   ✓ Committed',
            '✅ Mission complete with persistence! 💪'
        ]
    },
    swarm: {
        phases: 'plan → parallel execution → review → commit',
        description: 'Parallel execution with dependency management',
        output: [
            '🐝 Mission: swarm | Task: {task}',
            '📋 Phase: plan (mission-planner, ⚡ standard)',
            '   Analyzing task dependencies...',
            '   Created dependency graph with 3 waves',
            '🔀 Wave 1: Executing 2 independent tasks in parallel',
            '   ✓ Task 1 complete',
            '   ✓ Task 2 complete',
            '🔀 Wave 2: Executing 3 dependent tasks',
            '   ✓ All wave 2 tasks complete',
            '🔀 Wave 3: Final integration',
            '   ✓ Integration complete',
            '👁️  Phase: review (navigator, ⚡ standard)',
            '   Reviewing coordinated changes...',
            '   ✓ All tasks validated',
            '✅ Swarm mission complete! 🐝'
        ]
    },
    evolve: {
        phases: 'continuous improvement cycle',
        description: 'Self-improvement loop',
        output: [
            '🔄 Starting evolution cycle...',
            '',
            '📦 Cycle 1: Processing cargo manifest...',
            '   Found task: "Improve performance"',
            '   ✓ Optimizations applied',
            '',
            '🐙 Cycle 2: Checking GitHub issues...',
            '   Found issue #15: "Add feature X"',
            '   ✓ Feature implemented',
            '',
            '🧠 Cycle 3: Self-improvement scan...',
            '   Identified: Code duplication',
            '   ✓ Refactoring complete',
            '',
            '✅ Evolution complete! 3 improvements made 🚀'
        ]
    }
};

// Copy code to clipboard
function copyCode(button) {
    const codeBlock = button.previousElementSibling;
    const text = codeBlock.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = 'Copy';
            button.classList.remove('copied');
        }, 2000);
    });
}

// Show mission details
function showMission(missionId) {
    // Hide all mission details
    document.querySelectorAll('.mission-detail').forEach(detail => {
        detail.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.mission-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected mission
    const selectedMission = document.getElementById(`mission-${missionId}`);
    if (selectedMission) {
        selectedMission.classList.add('active');
    }
    
    // Highlight active button
    event.target.classList.add('active');
}

// Show example
function showExample(exampleId) {
    // Hide all examples
    document.querySelectorAll('.example-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.example-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected example
    const selectedExample = document.getElementById(`example-${exampleId}`);
    if (selectedExample) {
        selectedExample.classList.add('active');
    }
    
    // Highlight active tab
    event.target.classList.add('active');
}

// Set command in playground
function setCommand(command) {
    const input = document.getElementById('command-input');
    input.value = command.replace(/&quot;/g, '"');
    executeCommand();
}

// Execute command in playground
function executeCommand() {
    const input = document.getElementById('command-input');
    const command = input.value.trim();
    
    if (!command) {
        return;
    }
    
    // Parse command
    const parts = command.split(' ');
    const missionType = parts[0];
    const taskMatch = command.match(/"([^"]+)"/);
    const task = taskMatch ? taskMatch[1] : 'your task';
    
    // Get mission configuration
    let mission = missions[missionType];
    
    // Handle special cases
    if (missionType === 'evolve') {
        mission = missions.evolve;
    } else if (!mission) {
        mission = missions.launch; // Default fallback
    }
    
    // Generate output
    const resultDiv = document.getElementById('playground-result');
    const terminalBody = resultDiv.querySelector('.terminal-body');
    terminalBody.innerHTML = '';
    
    // Animate output
    let lineIndex = 0;
    const outputLines = mission.output.map(line => 
        line.replace('{task}', task)
    );
    
    function addLine() {
        if (lineIndex < outputLines.length) {
            const line = outputLines[lineIndex];
            const lineDiv = document.createElement('div');
            lineDiv.className = 'terminal-line';
            
            if (lineIndex === 0) {
                lineDiv.innerHTML = `<span class="prompt">$</span> orbit ${command}`;
            } else if (line.trim() === '') {
                lineDiv.innerHTML = '&nbsp;';
            } else {
                lineDiv.className = 'terminal-line output';
                lineDiv.textContent = line;
            }
            
            terminalBody.appendChild(lineDiv);
            terminalBody.scrollTop = terminalBody.scrollHeight;
            
            lineIndex++;
            setTimeout(addLine, 150);
        }
    }
    
    addLine();
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Add enter key support for playground
document.getElementById('command-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        executeCommand();
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all feature cards and doc cards
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .doc-card, .install-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Display initial placeholder in playground
document.addEventListener('DOMContentLoaded', () => {
    const resultDiv = document.getElementById('playground-result');
    if (resultDiv) {
        const terminalBody = resultDiv.querySelector('.terminal-body');
        if (terminalBody && terminalBody.children.length === 0) {
            terminalBody.innerHTML = '<div class="terminal-line placeholder">Enter a command to see the expected workflow...</div>';
        }
    }
});
