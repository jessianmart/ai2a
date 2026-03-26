// ============================================================================
// AI2A - Agent Factory Type System v3.0
// MAS · MoE · AOS (Agentive Operating System)
// ============================================================================

// --- Core Enums ---

export enum Mode {
  AGENT_ARCHITECT   = 'AGENT_ARCHITECT',
  SKILL_ARCHITECT   = 'SKILL_ARCHITECT',
  TOOL_ARCHITECT    = 'TOOL_ARCHITECT',
  MEMORY_ARCHITECT  = 'MEMORY_ARCHITECT',
  ORCHESTRATOR      = 'ORCHESTRATOR',
  MAS_PIPELINE      = 'MAS_PIPELINE',
  AOS_BUILDER       = 'AOS_BUILDER',
  PROMPT_ARCHITECT  = 'PROMPT_ARCHITECT', // World's best system prompt creator + model router
}

export enum AgentArchetype {
  EXECUTOR     = 'executor',
  VALIDATOR    = 'validator',
  CRITIC       = 'critic',
  RESEARCHER   = 'researcher',
  STRATEGIST   = 'strategist',
  SPECIALIST   = 'specialist',
  COORDINATOR  = 'coordinator',
  MONITOR      = 'monitor',
  MANAGER      = 'manager',     // NEW: Manager Agent (planner/orchestrator of a swarm)
  SWARM_MEMBER = 'swarm_member', // NEW: Member of a specialist swarm
}

export enum AutonomyLevel {
  FULL          = 'full',          // Acts independently, reports results
  SUPERVISED    = 'supervised',    // Proposes actions, waits for approval
  REACTIVE      = 'reactive',      // Only acts when explicitly triggered
  COLLABORATIVE = 'collaborative', // Negotiates with peers before acting
}

export enum MemoryType {
  EPISODIC   = 'episodic',   // Per-session conversation history
  SEMANTIC   = 'semantic',   // Long-term facts, rules, embeddings
  PROCEDURAL = 'procedural', // Learned workflows and successful paths
  WORKING    = 'working',    // Short-term scratchpad for active reasoning
}

export enum ToolInterface {
  MCP       = 'mcp',
  REST      = 'rest',
  CLI       = 'cli',
  FUNCTION  = 'function',
  WEBSOCKET = 'websocket',
}

export enum CommunicationProtocol {
  A2A       = 'a2a',       // Agent-to-Agent direct
  MCP       = 'mcp',       // Model Context Protocol
  BROADCAST = 'broadcast', // One-to-many
  PUB_SUB   = 'pub_sub',   // Event-driven
  P2P       = 'p2p',       // Peer-to-peer negotiation
}

// --- AOS: Human Organization ---

export enum HumanRole {
  CEO              = 'CEO',
  CAIO             = 'CAIO',   // Chief AI Officer
  CFO              = 'CFO',
  AI_OWNER         = 'AI_Owner',
  AI_AGENT_BUILDER = 'AI_Agent_Builder',
  AI_CHAMPION      = 'AI_Champion',
}

export enum DepartmentType {
  STRATEGY_GROWTH  = 'strategy_growth',
  FINANCE_FISCAL   = 'finance_fiscal',
  CRM_CS           = 'crm_cs',
  OPERATIONS       = 'operations',
  LEGAL_COMPLIANCE = 'legal_compliance',
  HR_TALENT        = 'hr_talent',
  PRODUCT_TECH     = 'product_tech',
}

// --- AOS: KPIs & Governance ---

export interface KPIConfig {
  model_confidence: {
    target: number;    // 0–1, e.g. 0.90
    alert_below: number;
  };
  mttr_seconds: {      // Mean Time to Remediation
    target: number;
    alert_above: number;
  };
  token_cost_per_result: {
    currency: string;
    target_usd: number;
    alert_above_usd: number;
  };
  hallucination_rate: {
    target: number;    // 0–1, e.g. 0.02
    alert_above: number;
  };
  custom_kpis: Array<{
    name: string;
    description: string;
    target: string;
    alert_condition: string;
  }>;
}

export type EscalationTriggerType =
  | 'irreversible_action'   // Financial tx above limit, critical data deletion
  | 'policy_conflict'       // Two org policies contradict
  | 'acute_negative_sentiment' // Extreme customer frustration
  | 'low_confidence';       // Model below confidence threshold

export interface EscalationTrigger {
  type: EscalationTriggerType;
  description: string;
  condition: string;         // e.g. "financial_transaction > $10,000"
  escalates_to: HumanRole;
  action: string;            // What happens when triggered
  timeout_minutes: number;   // If human doesn't respond in N min, do this
  fallback_action: string;
}

// --- AOS: Agent Swarm ---

export interface AgentSwarm {
  id: string;
  name: string;
  mission: string;
  department: DepartmentType;
  manager_agent: AgentConfig;       // Manager Agent (planner)
  specialist_agents: AgentConfig[]; // Executor specialists
  moe_chamber: MoEChamber;
  skills: string[];                 // Skill IDs available to this swarm
  tools: string[];                  // Tool IDs available to this swarm
  shared_memory: string[];          // Memory IDs shared within swarm
  kpis: KPIConfig;
  communication_protocol: CommunicationProtocol;
}

// --- AOS: Department ---

export interface HumanRoleConfig {
  role: HumanRole;
  name: string;
  strategic_mandate: string;
  core_competencies: string[];
  owned_departments: DepartmentType[];
  escalation_receiver: boolean;  // Can receive escalations
}

export interface Department {
  id: string;
  name: string;
  type: DepartmentType;
  mission: string;
  human_owner: HumanRole;
  swarms: AgentSwarm[];
  department_memory: MemoryConfig[];
  escalation_triggers: EscalationTrigger[];
  communication_topology: 'star' | 'mesh' | 'hierarchical' | 'ring';
  operates_24_7: boolean;
  created_at: number;
}

// --- AOS: Complete Organization ---

export interface AOSOrganization {
  id: string;
  name: string;
  vision: string;             // CEO's long-term vision
  industry: string;
  human_team: HumanRoleConfig[];
  departments: Department[];
  global_kpis: KPIConfig;
  global_escalation_triggers: EscalationTrigger[];
  communication_backbone: CommunicationProtocol;
  anti_hallucination_policy: {
    enabled: boolean;
    applies_to: string[];   // Department types or 'all'
    min_validators: number;
  };
  created_at: number;
  tags: string[];
}

// --- Agent Specification ---

export interface AgentDNA {
  archetype: AgentArchetype;
  tone: string;
  autonomy: AutonomyLevel;
  confidence_threshold: number;
  reasoning_style: 'chain_of_thought' | 'tree_of_thought' | 'react' | 'reflexion';
}

export interface AgentHierarchy {
  parent: string | null;
  sub_agents: string[];
  peers: string[];
  communication: CommunicationProtocol;
}

export interface AgentGuardrails {
  max_iterations: number;
  timeout_seconds: number;
  forbidden_actions: string[];
  escalation_rules: string[];
  anti_hallucination: boolean;
}

export interface AgentConfig {
  id: string;
  name: string;
  version: string;
  mission: string;
  dna: AgentDNA;
  specialization: string;
  hierarchy: AgentHierarchy;
  tools: string[];
  skills: string[];
  memory_strategy: MemoryType[];
  guardrails: AgentGuardrails;
  system_prompt: string;
  created_at: number;
  tags: string[];
}

// --- Skill Specification ---

export interface SkillActivation {
  triggers: string[];
  parameters: Record<string, { type: string; required: boolean; description: string }>;
  preconditions: string[];
}

export interface SkillImplementation {
  type: 'python' | 'javascript' | 'typescript' | 'pseudo' | 'prompt_chain';
  code: string;
  steps: string[];
  dependencies: string[];
}

export interface SkillOutput {
  format: 'json' | 'text' | 'markdown' | 'structured';
  schema: Record<string, string>;
  confidence_required: number;
}

export interface SkillConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  activation: SkillActivation;
  requirements: { languages: string[]; libraries: string[]; apis: string[] };
  implementation: SkillImplementation;
  output: SkillOutput;
  allowed_agents: string[];
  created_at: number;
  tags: string[];
}

// --- Tool Specification ---

export interface ToolAuth {
  strategy: 'api_key' | 'oauth2' | 'session' | 'none' | 'mTLS';
  config: Record<string, string>;
}

export interface ToolExecution {
  sandbox: boolean;
  timeout_ms: number;
  retry_policy: { max_retries: number; backoff_ms: number };
  rate_limit: { requests_per_minute: number };
}

export interface ToolConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  interface_type: ToolInterface;
  endpoint: string;
  auth: ToolAuth;
  execution: ToolExecution;
  input_schema: Record<string, { type: string; required: boolean; description: string }>;
  output_schema: Record<string, string>;
  mcp_compatible: boolean;
  created_at: number;
  tags: string[];
}

// --- Memory Specification ---

export interface MemoryConfig {
  id: string;
  name: string;
  type: MemoryType;
  description: string;
  strategy: {
    storage: 'in_memory' | 'local_storage' | 'vector_db' | 'graph_db' | 'hybrid';
    ttl_seconds: number | null;
    max_entries: number;
    indexing: 'sequential' | 'embedding' | 'keyword' | 'hybrid';
    retrieval: 'recency' | 'relevance' | 'importance' | 'combined';
  };
  schema: Record<string, string>;
  access_control: {
    readable_by: string[];
    writable_by: string[];
    shared: boolean;
  };
  created_at: number;
  tags: string[];
}

// --- MAS/MoE Structures ---

export interface MoEChamber {
  id: string;
  name: string;
  mission: string;
  experts: string[];
  router: {
    strategy: 'confidence_based' | 'token_based' | 'learned' | 'round_robin';
    top_k: number;
  };
  anti_hallucination_triad: {
    executor: string;
    validator: string;
    critic: string;
  };
}

export interface MASPipeline {
  id: string;
  name: string;
  description: string;
  agents: AgentConfig[];
  skills: SkillConfig[];
  tools: ToolConfig[];
  memory: MemoryConfig[];
  chambers: MoEChamber[];
  communication_topology: 'star' | 'mesh' | 'hierarchical' | 'ring';
  created_at: number;
}

// --- Registry ---

export interface RegistryState {
  agents: AgentConfig[];
  skills: SkillConfig[];
  tools: ToolConfig[];
  memories: MemoryConfig[];
  pipelines: MASPipeline[];
  organizations: AOSOrganization[];
  departments: Department[];
}

// --- UI Types ---

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  metadata?: {
    generated_type?: 'agent' | 'skill' | 'tool' | 'memory' | 'pipeline' | 'organization' | 'department';
    generated_id?: string;
  };
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  mode: Mode;
}

export type StreamChunk = { text: string; }

// --- Quick-Start Presets ---

export interface DepartmentPreset {
  id: string;
  label: string;
  type: DepartmentType;
  description: string;
  swarm_count: number;
  prompt: string;
}
