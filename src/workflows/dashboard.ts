// 📊 ORBIT Dashboard - Analytics HTML Generator
// Generates an interactive dashboard from metrics

import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { exportMetricsForDashboard, getMetricsSummary, getRecentRuns } from '../core/metrics.js';
import { getSkillStats } from '../core/skills.js';
import { loadFuelUsage } from '../core/state.js';
import { colors, printSuccess } from '../utils/output.js';

const DASHBOARD_DIR = '.copilot/dashboard';
const DASHBOARD_FILE = join(DASHBOARD_DIR, 'index.html');

export function generateDashboard(): void {
  if (!existsSync(DASHBOARD_DIR)) {
    mkdirSync(DASHBOARD_DIR, { recursive: true });
  }
  
  const metrics = exportMetricsForDashboard();
  const summary = getMetricsSummary();
  const skills = getSkillStats();
  const fuel = loadFuelUsage();
  const recent = getRecentRuns(10);
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🛸 ORBIT Dashboard</title>
  <style>
    :root {
      --bg: #0a0a1a;
      --card: #12122a;
      --accent: #00d4ff;
      --success: #00ff88;
      --warning: #ffaa00;
      --error: #ff4466;
      --text: #e0e0e0;
      --dim: #666;
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
    .header h1 {
      font-size: 2.5rem;
      color: var(--accent);
    }
    .header p {
      color: var(--dim);
      margin-top: 0.5rem;
    }
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
      border: 1px solid rgba(0, 212, 255, 0.2);
    }
    .card h2 {
      font-size: 0.9rem;
      color: var(--dim);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
    }
    .stat {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--accent);
    }
    .stat.success { color: var(--success); }
    .stat.warning { color: var(--warning); }
    .stat.error { color: var(--error); }
    .stat-label {
      font-size: 0.8rem;
      color: var(--dim);
      margin-top: 0.25rem;
    }
    .bar-chart {
      margin-top: 1rem;
    }
    .bar-row {
      display: flex;
      align-items: center;
      margin: 0.5rem 0;
    }
    .bar-label {
      width: 100px;
      font-size: 0.8rem;
      color: var(--dim);
    }
    .bar-track {
      flex: 1;
      height: 20px;
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--success));
      border-radius: 4px;
      transition: width 0.3s;
    }
    .bar-value {
      width: 50px;
      text-align: right;
      font-size: 0.8rem;
      color: var(--text);
    }
    .run-list {
      list-style: none;
    }
    .run-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .run-item:last-child { border: none; }
    .run-status {
      width: 24px;
      font-size: 1.2rem;
    }
    .run-task {
      flex: 1;
      font-size: 0.85rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .run-meta {
      font-size: 0.75rem;
      color: var(--dim);
    }
    .fuel-gauge {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    .fuel-tier {
      flex: 1;
      text-align: center;
    }
    .fuel-tier .icon { font-size: 1.5rem; }
    .fuel-tier .count { font-size: 1.2rem; font-weight: bold; }
    .fuel-tier .label { font-size: 0.7rem; color: var(--dim); }
    footer {
      text-align: center;
      margin-top: 3rem;
      color: var(--dim);
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🛸 ORBIT Dashboard</h1>
    <p>Orchestrated Robotic Build & Integration Toolkit</p>
  </div>
  
  <div class="grid">
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
      <div class="stat">${summary.avgDuration}s</div>
      <div class="stat-label">per mission</div>
    </div>
    
    <div class="card">
      <h2>Skills Learned</h2>
      <div class="stat">${skills.total}</div>
      <div class="stat-label">patterns extracted</div>
    </div>
    
    <!-- Fuel Usage -->
    <div class="card">
      <h2>Fuel Usage</h2>
      <div class="stat">${fuel.total.toFixed(1)}</div>
      <div class="stat-label">total units consumed</div>
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
    </div>
    
    <!-- Mission Types -->
    <div class="card">
      <h2>By Mission Type</h2>
      <div class="bar-chart">
        ${Object.entries(summary.byMission).map(([mission, data]) => `
        <div class="bar-row">
          <div class="bar-label">${mission}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${(data as any).successRate}%"></div>
          </div>
          <div class="bar-value">${(data as any).count}</div>
        </div>
        `).join('')}
      </div>
    </div>
    
    <!-- Phase Performance -->
    <div class="card">
      <h2>By Phase</h2>
      <div class="bar-chart">
        ${Object.entries(summary.byPhase).map(([phase, data]) => `
        <div class="bar-row">
          <div class="bar-label">${phase}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${(data as any).successRate}%"></div>
          </div>
          <div class="bar-value">${(data as any).avgDuration}s</div>
        </div>
        `).join('')}
      </div>
    </div>
    
    <!-- Recent Runs -->
    <div class="card" style="grid-column: span 2;">
      <h2>Recent Missions</h2>
      <ul class="run-list">
        ${recent.map(run => `
        <li class="run-item">
          <span class="run-status">${run.success ? '✅' : '❌'}</span>
          <span class="run-task">${run.task.slice(0, 50)}${run.task.length > 50 ? '...' : ''}</span>
          <span class="run-meta">${run.mission} • ${run.totalDuration}s</span>
        </li>
        `).join('')}
      </ul>
    </div>
  </div>
  
  <footer>
    Generated ${new Date().toISOString()} | ORBIT v1.0.0
  </footer>
  
  <script>
    // Auto-refresh every 30 seconds
    setTimeout(() => location.reload(), 30000);
  </script>
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
