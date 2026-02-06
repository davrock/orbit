// 🛸 ORBIT Core Types
// Orchestrated Robotic Build & Integration Toolkit

export type ModelTier = 'premium' | 'standard' | 'fast' | 'ecomode';

export type MissionType = 
  | 'launch' | 'repair' | 'warp' | 'mayday' | 'preflight'
  | 'shields-up' | 'dock' | 'transmit' | 'apollo' | 'ralph' | 'ultrawork' | 'swarm' | 'pipeline'
  | 'design-review';

export type Phase = 
  | 'plan' | 'implement' | 'test' | 'review' | 'debug' 
  | 'commit' | 'security' | 'document' | 'research';

export type CrewMember = 
  | 'commander' | 'pilot' | 'engineer' | 'navigator' | 'specialist'
  | 'security-officer' | 'propulsion' | 'comms' | 'ground-control'
  | 'mission-planner' | 'scout' | 'hal'
  | 'data-scientist' | 'ml-engineer' | 'devops' | 'frontend-specialist'
  | 'backend-specialist' | 'database-architect' | 'api-designer'
  | 'ux-researcher' | 'tech-writer' | 'qa-lead' | 'performance-engineer'
  | 'cloud-architect' | 'design-reviewer';

export type TechStack = 
  | 'node' | 'typescript' | 'react' | 'nextjs' | 'vue' | 'nuxt' | 'svelte' | 'angular'
  | 'expo' | 'react-native'
  | 'python' | 'django' | 'fastapi' | 'flask'
  | 'go' | 'rust' | 'java' | 'kotlin' | 'spring' | 'gradle' | 'maven' | 'android'
  | 'ruby' | 'rails' | 'php' | 'laravel' | 'symfony'
  | 'dotnet' | 'fsharp' | 'c' | 'cpp' | 'cmake'
  | 'elixir' | 'swift' | 'ios' | 'terraform' | 'docker' | 'unknown';

export interface ProjectConfig {
  name: string;
  techStack: TechStack;
  packageManager: string;
  gitBranch: string;
  typeCheckCmd?: string;
  testCmd?: string;
  lintCmd?: string;
  formatCmd?: string;
}

export interface MissionConfig {
  type: MissionType;
  task: string;
  phases: Phase[];
  modelTier: ModelTier;
  dryRun: boolean;
  interactive: boolean;
  customCrew?: CrewMember;
  persistenceMode?: boolean;
}

export interface PhaseResult {
  phase: Phase;
  crew: CrewMember;
  modelTier: ModelTier;
  success: boolean;
  duration: number;
  output?: string;
  error?: string;
}

export interface MissionResult {
  mission: MissionType;
  task: string;
  phases: PhaseResult[];
  totalDuration: number;
  success: boolean;
  filesChanged: number;
  commitHash?: string;
}

export interface FuelUsage {
  total: number;
  byTier: Record<ModelTier, number>;
  sessions: number;
}

export interface GroundControlState {
  fails: number;
  noProgress: number;
  types: string[];
  cycles: number;
  successes: number;
  lastTask?: string;
  lastError?: string;
}

export interface CargoItem {
  task: string;
  priority: 'high' | 'medium' | 'low';
  delivered: boolean;
  deliveredAt?: Date;
}

export interface FlightPlan {
  id: string;
  title: string;
  objective: string;
  status: 'draft' | 'issues_created' | 'in_progress' | 'complete' | 'failed';
  phases: FlightPlanPhase[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FlightPlanPhase {
  name: string;
  tasks: FlightPlanTask[];
}

export interface FlightPlanTask {
  id: string;
  description: string;
  completed: boolean;
  issueNumber?: number;
}

export interface Skill {
  id: string;
  pattern: string;
  solution: string;
  context: string;
  successCount: number;
  lastUsed: Date;
}

export interface HUDState {
  task: string;
  phases: Phase[];
  currentPhase: Phase;
  currentCrew: CrewMember;
  modelTier: ModelTier;
  startTime: Date;
  completedPhases: Phase[];
  status: 'running' | 'complete' | 'failed';
}
