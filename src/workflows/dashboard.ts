// 📊 ORBIT Dashboard - Analytics HTML Generator
// Generates an interactive dashboard from metrics

import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { exportMetricsForDashboard, getMetricsSummary, getRecentRuns, type MissionMetrics, type PhaseMetrics } from '../core/metrics.js';
import { getSkillStats } from '../core/skills.js';
import { loadFuelUsage } from '../core/state.js';
import { FlightPlanGenerator } from './flight-plan.js';
import { colors, printSuccess } from '../utils/output.js';
import { getConfigPaths } from '../utils/paths.js';
import type { FuelUsage } from '../core/types.js';

const DASHBOARD_DIR = `${getConfigPaths().base}/dashboard`;
const DASHBOARD_FILE = join(DASHBOARD_DIR, 'index.html');

interface DashboardData {
  metrics: object;
  summary: ReturnType<typeof getMetricsSummary>;
  skills: ReturnType<typeof getSkillStats>;
  fuel: FuelUsage;
  recent: ReturnType<typeof getRecentRuns>;
  plans: ReturnType<FlightPlanGenerator['listPlans']>;
}

interface DashboardMetrics {
  fuelPerSession: string;
  fuelTotal: string;
  topTier: [string, number] | undefined;
  topTierPct: number;
  avgDurDisplay: string;
  totalPlanTasks: number;
  completedPlanTasks: number;
  planProgress: number;
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function collectDashboardData(): DashboardData {
  const metrics = exportMetricsForDashboard();
  const summary = getMetricsSummary();
  const skills = getSkillStats();
  const fuel = loadFuelUsage();
  const recent = getRecentRuns(10);
  const fpGen = new FlightPlanGenerator();
  const plans = fpGen.listPlans();
  return { metrics, summary, skills, fuel, recent, plans };
}

function calculateDashboardMetrics(data: DashboardData): DashboardMetrics {
  const { fuel, summary, plans } = data;
  const fuelPerSession = fuel.sessions > 0 ? (fuel.total / fuel.sessions).toFixed(1) : '0';
  const fuelTotal = fuel.total.toFixed(1);
  const topTier = Object.entries(fuel.byTier).sort((a, b) => b[1] - a[1])[0];
  const topTierPct = fuel.total > 0 ? Math.round((topTier[1] / fuel.total) * 100) : 0;
  const avgDurDisplay = summary.avgDuration > 0 ? formatDuration(summary.avgDuration) : '—';
  const totalPlanTasks = plans.reduce((s, p) => s + p.totalTasks, 0);
  const completedPlanTasks = plans.reduce((s, p) => s + p.completedTasks, 0);
  const planProgress = totalPlanTasks > 0 ? Math.round((completedPlanTasks / totalPlanTasks) * 100) : 0;
  return { fuelPerSession, fuelTotal, topTier, topTierPct, avgDurDisplay, totalPlanTasks, completedPlanTasks, planProgress };
}

function buildStatsSection(data: DashboardData, metrics: DashboardMetrics): string {
  const { summary, skills } = data;
  return `
    <!-- Summary Stats -->
    <div class="card">
      <h2>Total Missions</h2>
      <div class="stat">${summary.totalRuns}</div>
      <div class="stat-label">completed runs</div>
    </div>
    
    <div class="card">
      <h2>Success Rate</h2>
      <div class="stat ${summary.successRate >= 80 ? 'success' : summary.successRate >= 50 ? 'warning' : 'error'}">${summary.successRate}%</div>
      <div class="stat-label">mission success</div>
    </div>
    
    <div class="card">
      <h2>Avg Duration</h2>
      <div class="stat">${metrics.avgDurDisplay}</div>
      <div class="stat-label">per mission</div>
    </div>
    
    <div class="card">
      <h2>Skills Learned</h2>
      <div class="stat">${skills.total}</div>
      <div class="stat-label">patterns extracted</div>
    </div>`;
}

function buildFuelSection(data: DashboardData, metrics: DashboardMetrics): string {
  const { fuel } = data;
  return `
    <!-- Fuel Usage - Enhanced -->
    <div class="card">
      <h2>⛽ Fuel Usage</h2>
      <div class="stat">${metrics.fuelTotal}</div>
      <div class="stat-label">total units consumed</div>
      <div class="stat-context">
        📊 ${metrics.fuelPerSession} units/session avg · ${fuel.sessions} sessions<br>
        🏷️ ${metrics.topTierPct}% ${metrics.topTier?.[0] || 'standard'} tier usage
      </div>
      <div class="fuel-gauge">
        <div class="fuel-tier">
          <div class="icon">🔥</div>
          <div class="count">${fuel.byTier.premium}</div>
          <div class="label">Premium</div>
        </div>
        <div class="fuel-tier">
          <div class="icon">⚡</div>
          <div class="count">${fuel.byTier.standard}</div>
          <div class="label">Standard</div>
        </div>
        <div class="fuel-tier">
          <div class="icon">💨</div>
          <div class="count">${fuel.byTier.fast}</div>
          <div class="label">Fast</div>
        </div>
      </div>
    </div>`;
}

function buildMissionBarRow(mission: string, data: MissionMetrics): string {
  return `
        <div class="bar-row">
          <div class="bar-label">${mission}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${data.successRate}%"></div>
          </div>
          <div class="bar-value">${data.count}</div>
        </div>`;
}

function buildPhaseBarRow(phase: string, data: PhaseMetrics): string {
  return `
        <div class="bar-row">
          <div class="bar-label">${phase}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${data.successRate}%"></div>
          </div>
          <div class="bar-value">${formatDuration(data.avgDuration)}</div>
        </div>`;
}

function buildPerformanceCharts(data: DashboardData): string {
  const { summary } = data;
  return `
    <!-- Mission Types -->
    <div class="card">
      <h2>By Mission Type</h2>
      <div class="bar-chart">
        ${Object.entries(summary.byMission).map(([mission, mData]) => buildMissionBarRow(mission, mData)).join('')}
      </div>
    </div>
    
    <!-- Phase Performance -->
    <div class="card">
      <h2>By Phase</h2>
      <div class="bar-chart">
        ${Object.entries(summary.byPhase).map(([phase, pData]) => buildPhaseBarRow(phase, pData)).join('')}
      </div>
    </div>`;
}

function buildRecentRunsSection(data: DashboardData): string {
  const { recent } = data;
  return `
    <!-- Recent Runs -->
    <div class="card" style="grid-column: span 2;">
      <h2>Recent Missions</h2>
      <ul class="run-list">
        ${recent.map(run => `
        <li class="run-item">
          <span class="run-status">${run.success ? '✅' : '❌'}</span>
          <span class="run-task">${run.task.slice(0, 60)}${run.task.length > 60 ? '...' : ''}</span>
          <span class="run-meta">${run.mission || '—'} · ${formatDuration(run.totalDuration)}</span>
        </li>
        `).join('')}
      </ul>
    </div>`;
}

function buildFlightPlansSection(data: DashboardData, metrics: DashboardMetrics): string {
  const { plans } = data;
  return `
    <!-- FLIGHT PLANS SECTION -->
    <hr class="section-divider">
    <div class="section-title">📋 Flight Plans</div>

    <!-- Plans Overview -->
    <div class="card">
      <h2>Plans Overview</h2>
      <div class="stat">${plans.length}</div>
      <div class="stat-label">flight plans</div>
      <div class="stat-context">
        ✅ ${metrics.completedPlanTasks}/${metrics.totalPlanTasks} tasks completed (${metrics.planProgress}%)
      </div>
      <div class="plan-progress" style="margin-top: 0.75rem;">
        <div class="plan-progress-fill" style="width: ${metrics.planProgress}%"></div>
      </div>
    </div>

    <!-- Active Plans List -->
    <div class="card" style="grid-column: span 2;">
      <h2>Flight Plans</h2>
      ${plans.length === 0 ? '<div class="stat-context">No plans yet — use the Mission Composer below to create one.</div>' : plans.map(plan => {
        const pProg = plan.totalTasks > 0 ? Math.round((plan.completedTasks / plan.totalTasks) * 100) : 0;
        return `
      <div class="plan-item">
        <div class="plan-header">
          <span class="title">${plan.title}</span>
          <span class="plan-status ${plan.status}">${plan.status.replace('_', ' ')}</span>
        </div>
        <div class="plan-progress">
          <div class="plan-progress-fill" style="width: ${pProg}%"></div>
        </div>
        <div class="plan-meta">${plan.id} · ${plan.completedTasks}/${plan.totalTasks} tasks · ${plan.createdAt || '—'}</div>
      </div>`;
      }).join('')}
    </div>`;
}

function buildMissionComposerSection(data: DashboardData): string {
  const { plans } = data;
  return `
    <!-- MISSION COMPOSER SECTION -->
    <hr class="section-divider">
    <div class="section-title">🚀 Mission Composer</div>

    <div class="card" style="grid-column: span 2;">
      <h2>Quick Launch</h2>
      <p style="font-size: 0.8rem; color: var(--dim); margin-bottom: 1rem;">
        Describe what you want to build. ORBIT generates the CLI command to run.
      </p>

      <div class="quick-actions">
        <button class="quick-action" onclick="setTemplate('feature')">✨ New Feature</button>
        <button class="quick-action" onclick="setTemplate('bugfix')">🔧 Fix Bug</button>
        <button class="quick-action" onclick="setTemplate('refactor')">♻️ Refactor</button>
        <button class="quick-action" onclick="setTemplate('test')">🧪 Add Tests</button>
        <button class="quick-action" onclick="setTemplate('docs')">📚 Documentation</button>
        <button class="quick-action" onclick="setTemplate('security')">🔒 Security Audit</button>
        <button class="quick-action" onclick="setTemplate('perf')">⚡ Performance</button>
        <button class="quick-action" onclick="setTemplate('plan')">📋 Flight Plan</button>
      </div>

      <div class="composer">
        <textarea id="missionInput" class="composer-input" placeholder="Describe your mission...&#10;e.g. &quot;Add user authentication with JWT tokens and refresh flow&quot;"></textarea>
        <div class="composer-actions">
          <select id="missionMode" class="depth-select">
            <option value="launch">🚀 launch — full mission</option>
            <option value="warp">⚡ warp — quick change</option>
            <option value="repair">🔧 repair — fix a bug</option>
            <option value="plan">📋 flight-plan — plan only</option>
            <option value="ultrawork">🔥 ultrawork — deep work</option>
            <option value="swarm">🐝 swarm — parallel agents</option>
          </select>
          <select id="missionTier" class="depth-select">
            <option value="">default tier</option>
            <option value="--premium">🔥 premium</option>
            <option value="--fast">💨 fast</option>
          </select>
          <button class="composer-btn primary" onclick="generateCommand()">Generate Command</button>
          <button class="composer-btn" onclick="copyCommand()">📋 Copy</button>
        </div>
        <div id="commandOutput" class="composer-output"></div>
      </div>
    </div>

    <div class="card">
      <h2>Flight Plan Builder</h2>
      <p style="font-size: 0.8rem; color: var(--dim); margin-bottom: 1rem;">
        Break down a feature into a structured plan.
      </p>
      <textarea id="planFeature" class="composer-input" placeholder="Describe the feature to plan...&#10;e.g. &quot;User authentication system with OAuth2&quot;" style="min-height: 50px;"></textarea>
      <div class="composer-actions" style="margin-top: 0.5rem;">
        <select id="planDepth" class="depth-select">
          <option value="1">Depth 1 — high-level (3-5 tasks)</option>
          <option value="2" selected>Depth 2 — standard (8-12 tasks)</option>
          <option value="3">Depth 3 — detailed (15+ tasks)</option>
        </select>
        <button class="composer-btn primary" onclick="generatePlanCommand()">Generate</button>
        <button class="composer-btn" onclick="copyPlanCommand()">📋 Copy</button>
      </div>
      <div id="planOutput" class="composer-output"></div>
    </div>

    <div class="card">
      <h2>Publish to GitHub</h2>
      <p style="font-size: 0.8rem; color: var(--dim); margin-bottom: 1rem;">
        Push a flight plan to GitHub as trackable work items.
      </p>
      <select id="publishPlan" class="depth-select" style="width: 100%; margin-bottom: 0.5rem;">
        ${plans.length === 0 ? '<option>No plans available</option>' :
          plans.map(p => `<option value="${p.id}">${p.id}: ${p.title}</option>`).join('')}
      </select>
      <select id="publishMode" class="depth-select" style="width: 100%; margin-bottom: 0.5rem;">
        <option value="epic">🎯 Epic — parent issues + sub-issues</option>
        <option value="milestone">📌 Milestone — milestone + labeled issues</option>
        <option value="issues">📋 Flat Issues — simple issue list</option>
      </select>
      <div class="composer-actions">
        <button class="composer-btn primary" onclick="generatePublishCommand()">Generate</button>
        <button class="composer-btn" onclick="copyPublishCommand()">📋 Copy</button>
      </div>
      <div id="publishOutput" class="composer-output"></div>
    </div>`;
}

function buildDashboardStyles(): string {
  return `  <style>
    :root {
      --bg: #0a0a1a;
      --card: #12122a;
      --card-hover: #1a1a3a;
      --accent: #00d4ff;
      --success: #00ff88;
      --warning: #ffaa00;
      --error: #ff4466;
      --text: #e0e0e0;
      --dim: #666;
      --border: rgba(0, 212, 255, 0.2);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'SF Mono', 'Fira Code', monospace;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 2rem;
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .header h1 { font-size: 2.5rem; color: var(--accent); }
    .header p { color: var(--dim); margin-top: 0.5rem; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .card {
      background: var(--card);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid var(--border);
    }
    .card h2 {
      font-size: 0.9rem;
      color: var(--dim);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
    }
    .stat { font-size: 2.5rem; font-weight: bold; color: var(--accent); }
    .stat.success { color: var(--success); }
    .stat.warning { color: var(--warning); }
    .stat.error { color: var(--error); }
    .stat-label { font-size: 0.8rem; color: var(--dim); margin-top: 0.25rem; }
    .stat-context { font-size: 0.75rem; color: var(--dim); margin-top: 0.5rem; line-height: 1.6; }
    .bar-chart { margin-top: 1rem; }
    .bar-row { display: flex; align-items: center; margin: 0.5rem 0; }
    .bar-label { width: 100px; font-size: 0.8rem; color: var(--dim); }
    .bar-track {
      flex: 1; height: 20px;
      background: rgba(255,255,255,0.1);
      border-radius: 4px; overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--success));
      border-radius: 4px; transition: width 0.3s;
    }
    .bar-value { width: 50px; text-align: right; font-size: 0.8rem; color: var(--text); }
    .run-list { list-style: none; }
    .run-item {
      display: flex; align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .run-item:last-child { border: none; }
    .run-status { width: 24px; font-size: 1.2rem; }
    .run-task {
      flex: 1; font-size: 0.85rem;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .run-meta { font-size: 0.75rem; color: var(--dim); }
    .fuel-gauge { display: flex; gap: 1rem; margin-top: 1rem; }
    .fuel-tier { flex: 1; text-align: center; }
    .fuel-tier .icon { font-size: 1.5rem; }
    .fuel-tier .count { font-size: 1.2rem; font-weight: bold; }
    .fuel-tier .label { font-size: 0.7rem; color: var(--dim); }

    /* Flight Plans */
    .plan-item {
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .plan-item:last-child { border: none; }
    .plan-header {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.9rem; margin-bottom: 0.4rem;
    }
    .plan-header .title { flex: 1; }
    .plan-status {
      font-size: 0.7rem; padding: 2px 8px;
      border-radius: 4px; text-transform: uppercase;
    }
    .plan-status.draft { background: rgba(255,170,0,0.2); color: var(--warning); }
    .plan-status.in_progress { background: rgba(0,212,255,0.2); color: var(--accent); }
    .plan-status.complete { background: rgba(0,255,136,0.2); color: var(--success); }
    .plan-status.failed { background: rgba(255,68,102,0.2); color: var(--error); }
    .plan-status.issues_created { background: rgba(0,212,255,0.15); color: var(--accent); }
    .plan-progress {
      height: 6px; background: rgba(255,255,255,0.1);
      border-radius: 3px; overflow: hidden; margin-top: 0.3rem;
    }
    .plan-progress-fill {
      height: 100%; border-radius: 3px;
      background: linear-gradient(90deg, var(--accent), var(--success));
    }
    .plan-meta { font-size: 0.75rem; color: var(--dim); margin-top: 0.25rem; }

    /* Mission Composer */
    .composer {
      margin-top: 0.5rem;
    }
    .composer-input {
      width: 100%; padding: 0.75rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      border-radius: 8px; color: var(--text);
      font-family: inherit; font-size: 0.85rem;
      outline: none; resize: vertical; min-height: 60px;
    }
    .composer-input:focus { border-color: var(--accent); }
    .composer-input::placeholder { color: var(--dim); }
    .composer-actions {
      display: flex; gap: 0.5rem; margin-top: 0.75rem;
      flex-wrap: wrap;
    }
    .composer-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: transparent; color: var(--text);
      font-family: inherit; font-size: 0.8rem;
      cursor: pointer; transition: all 0.2s;
    }
    .composer-btn:hover {
      background: rgba(0,212,255,0.1);
      border-color: var(--accent);
    }
    .composer-btn.primary {
      background: rgba(0,212,255,0.15);
      border-color: var(--accent); color: var(--accent);
    }
    .composer-output {
      margin-top: 0.75rem; padding: 0.75rem;
      background: rgba(0,0,0,0.3); border-radius: 8px;
      font-size: 0.8rem; display: none;
      white-space: pre-wrap; line-height: 1.5;
      max-height: 300px; overflow-y: auto;
    }
    .composer-output.visible { display: block; }
    .depth-select {
      padding: 0.5rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      border-radius: 6px; color: var(--text);
      font-family: inherit; font-size: 0.8rem;
    }
    .quick-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .quick-action {
      padding: 0.4rem 0.8rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px; color: var(--dim);
      font-size: 0.75rem; cursor: pointer;
      transition: all 0.2s; font-family: inherit;
    }
    .quick-action:hover {
      color: var(--accent); border-color: var(--accent);
      background: rgba(0,212,255,0.1);
    }
    .section-divider {
      grid-column: 1 / -1;
      border: none; border-top: 1px solid var(--border);
      margin: 0.5rem 0;
    }
    .section-title {
      grid-column: 1 / -1;
      font-size: 1.1rem; color: var(--accent);
      padding: 0.5rem 0;
    }
    footer {
      text-align: center;
      margin-top: 3rem;
      color: var(--dim);
      font-size: 0.8rem;
    }
  </style>`; 
}

function buildDashboardScript(): string {
  return `  <script>
    const templates = {
      feature: { text: 'Add ', mode: 'launch' },
      bugfix: { text: 'Fix ', mode: 'repair' },
      refactor: { text: 'Refactor ', mode: 'launch' },
      test: { text: 'Add tests for ', mode: 'launch' },
      docs: { text: 'Document ', mode: 'warp' },
      security: { text: 'Security audit: ', mode: 'launch' },
      perf: { text: 'Optimize performance of ', mode: 'ultrawork' },
      plan: { text: '', mode: 'plan' }
    };

    function setTemplate(type) {
      const t = templates[type];
      document.getElementById('missionInput').value = t.text;
      document.getElementById('missionInput').focus();
      document.getElementById('missionMode').value = t.mode;
    }

    function generateCommand() {
      const input = document.getElementById('missionInput').value.trim();
      if (!input) return;
      const mode = document.getElementById('missionMode').value;
      const tier = document.getElementById('missionTier').value;
      const out = document.getElementById('commandOutput');

      let cmd;
      if (mode === 'plan') {
        cmd = 'orbit flight-plan new "' + input + '"';
      } else {
        cmd = 'orbit ' + mode + ' "' + input + '"';
        if (tier) cmd += ' ' + tier;
      }

      out.textContent = '$ ' + cmd;
      out.classList.add('visible');
    }

    function copyCommand() {
      const out = document.getElementById('commandOutput');
      const text = out.textContent.replace(/^\\$ /, '');
      navigator.clipboard.writeText(text);
      out.style.borderColor = 'var(--success)';
      setTimeout(() => out.style.borderColor = '', 1000);
    }

    function generatePlanCommand() {
      const feature = document.getElementById('planFeature').value.trim();
      if (!feature) return;
      const depth = document.getElementById('planDepth').value;
      const out = document.getElementById('planOutput');
      const cmd = 'orbit flight-plan new "' + feature + '" --depth ' + depth;
      out.textContent = '$ ' + cmd + '\\n\\n# After creation, publish to GitHub:\\n$ orbit flight-plan publish <plan-id> --mode epic';
      out.classList.add('visible');
    }

    function copyPlanCommand() {
      const out = document.getElementById('planOutput');
      const text = out.textContent.split('\\n')[0].replace(/^\\$ /, '');
      navigator.clipboard.writeText(text);
      out.style.borderColor = 'var(--success)';
      setTimeout(() => out.style.borderColor = '', 1000);
    }

    function generatePublishCommand() {
      const planId = document.getElementById('publishPlan').value;
      const mode = document.getElementById('publishMode').value;
      if (!planId) return;
      const out = document.getElementById('publishOutput');
      const dryCmd = 'orbit flight-plan publish ' + planId + ' --mode ' + mode + ' --dry-run';
      const runCmd = 'orbit flight-plan publish ' + planId + ' --mode ' + mode;
      out.textContent = '# Preview first:\\n$ ' + dryCmd + '\\n\\n# Then publish:\\n$ ' + runCmd;
      out.classList.add('visible');
    }

    function copyPublishCommand() {
      const planId = document.getElementById('publishPlan').value;
      const mode = document.getElementById('publishMode').value;
      const text = 'orbit flight-plan publish ' + planId + ' --mode ' + mode;
      navigator.clipboard.writeText(text);
      const out = document.getElementById('publishOutput');
      out.style.borderColor = 'var(--success)';
      setTimeout(() => out.style.borderColor = '', 1000);
    }
  </script>`;
}

export function generateDashboard(): void {
  if (!existsSync(DASHBOARD_DIR)) {
    mkdirSync(DASHBOARD_DIR, { recursive: true });
  }
  
  const data = collectDashboardData();
  const metrics = calculateDashboardMetrics(data);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🛸 ORBIT Dashboard</title>
${buildDashboardStyles()}
</head>
<body>
  <div class="header">
    <h1>🛸 ORBIT Dashboard</h1>
    <p>Orchestrated Robotic Build & Integration Toolkit</p>
  </div>
  
  <div class="grid">
${buildStatsSection(data, metrics)}
${buildFuelSection(data, metrics)}
${buildPerformanceCharts(data)}
${buildRecentRunsSection(data)}
${buildFlightPlansSection(data, metrics)}
${buildMissionComposerSection(data)}
  </div>
  
  <footer>
    Generated ${new Date().toISOString()} · ORBIT v1.0.0 · Refresh: <code>orbit dashboard --generate</code>
  </footer>
  
${buildDashboardScript()}
</body>
</html>`;

  writeFileSync(DASHBOARD_FILE, html);
  printSuccess(`Dashboard generated: ${DASHBOARD_FILE}`);
}

export function openDashboard(): void {
  if (!existsSync(DASHBOARD_FILE)) {
    generateDashboard();
  }
  
  // Try to open in browser
  const cmds = [
    `xdg-open ${DASHBOARD_FILE}`,  // Linux
    `open ${DASHBOARD_FILE}`,       // macOS
    `start ${DASHBOARD_FILE}`       // Windows
  ];
  
  for (const cmd of cmds) {
    try {
      execSync(cmd, { stdio: 'ignore' });
      return;
    } catch {
      // Try next
    }
  }
  
  console.log(`Open in browser: ${DASHBOARD_FILE}`);
}
