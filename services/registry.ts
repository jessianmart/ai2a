import {
  AgentConfig, SkillConfig, ToolConfig, MemoryConfig, MASPipeline,
  AOSOrganization, Department, RegistryState,
} from '../types';

const STORAGE_KEY = 'ai2a_registry_v3';

const defaultState: RegistryState = {
  agents: [],
  skills: [],
  tools: [],
  memories: [],
  pipelines: [],
  organizations: [],
  departments: [],
};

const load = (): RegistryState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw) as RegistryState;
    // Ensure new fields exist (migration)
    return {
      ...defaultState,
      ...parsed,
      organizations: parsed.organizations ?? [],
      departments: parsed.departments ?? [],
    };
  } catch {
    return { ...defaultState };
  }
};

const save = (state: RegistryState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// --- Public API ---

export const getRegistry = (): RegistryState => load();

export const addAgent = (agent: AgentConfig): RegistryState => {
  const state = load();
  state.agents = state.agents.filter(a => a.id !== agent.id);
  state.agents.unshift(agent);
  save(state);
  return state;
};

export const addSkill = (skill: SkillConfig): RegistryState => {
  const state = load();
  state.skills = state.skills.filter(s => s.id !== skill.id);
  state.skills.unshift(skill);
  save(state);
  return state;
};

export const addTool = (tool: ToolConfig): RegistryState => {
  const state = load();
  state.tools = state.tools.filter(t => t.id !== tool.id);
  state.tools.unshift(tool);
  save(state);
  return state;
};

export const addMemory = (memory: MemoryConfig): RegistryState => {
  const state = load();
  state.memories = state.memories.filter(m => m.id !== memory.id);
  state.memories.unshift(memory);
  save(state);
  return state;
};

export const addPipeline = (pipeline: MASPipeline): RegistryState => {
  const state = load();
  state.pipelines = state.pipelines.filter(p => p.id !== pipeline.id);
  state.pipelines.unshift(pipeline);
  save(state);
  return state;
};

export const addOrganization = (org: AOSOrganization): RegistryState => {
  const state = load();
  state.organizations = state.organizations.filter(o => o.id !== org.id);
  state.organizations.unshift(org);
  save(state);
  return state;
};

export const addDepartment = (dept: Department): RegistryState => {
  const state = load();
  state.departments = state.departments.filter(d => d.id !== dept.id);
  state.departments.unshift(dept);
  save(state);
  return state;
};

export const removeAgent = (id: string): RegistryState => {
  const state = load();
  state.agents = state.agents.filter(a => a.id !== id);
  save(state); return state;
};

export const removeSkill = (id: string): RegistryState => {
  const state = load();
  state.skills = state.skills.filter(s => s.id !== id);
  save(state); return state;
};

export const removeTool = (id: string): RegistryState => {
  const state = load();
  state.tools = state.tools.filter(t => t.id !== id);
  save(state); return state;
};

export const removeMemory = (id: string): RegistryState => {
  const state = load();
  state.memories = state.memories.filter(m => m.id !== id);
  save(state); return state;
};

export const removePipeline = (id: string): RegistryState => {
  const state = load();
  state.pipelines = state.pipelines.filter(p => p.id !== id);
  save(state); return state;
};

export const removeOrganization = (id: string): RegistryState => {
  const state = load();
  state.organizations = state.organizations.filter(o => o.id !== id);
  save(state); return state;
};

export const removeDepartment = (id: string): RegistryState => {
  const state = load();
  state.departments = state.departments.filter(d => d.id !== id);
  save(state); return state;
};

export const clearRegistry = (): RegistryState => {
  const state = { ...defaultState };
  save(state);
  return state;
};

export const getStats = () => {
  const state = load();
  return {
    agents: state.agents.length,
    skills: state.skills.length,
    tools: state.tools.length,
    memories: state.memories.length,
    pipelines: state.pipelines.length,
    organizations: state.organizations.length,
    departments: state.departments.length,
    total: state.agents.length + state.skills.length + state.tools.length +
      state.memories.length + state.pipelines.length +
      state.organizations.length + state.departments.length,
  };
};

/**
 * Try to parse a JSON config block from AI response and save to registry.
 * Handles: agent_config, skill_config, tool_config, memory_config, pipeline, organization, department
 */
export const parseAndSave = (json: Record<string, unknown>): { type: string; item: unknown } | null => {
  const ts = Date.now();

  if (json.organization) {
    const org = json.organization as AOSOrganization;
    if (!org.id) org.id = `org_${ts}`;
    if (!org.created_at) org.created_at = ts;
    addOrganization(org);
    // Also auto-register all departments
    if (org.departments) {
      org.departments.forEach(dept => {
        if (!dept.id) dept.id = `dept_${ts}`;
        if (!dept.created_at) dept.created_at = ts;
        addDepartment(dept);
      });
    }
    return { type: 'organization', item: org };
  }
  if (json.department) {
    const dept = json.department as Department;
    if (!dept.id) dept.id = `dept_${ts}`;
    if (!dept.created_at) dept.created_at = ts;
    addDepartment(dept);
    return { type: 'department', item: dept };
  }
  if (json.agent_config) {
    const agent = json.agent_config as AgentConfig;
    if (!agent.id) agent.id = `agent_${ts}`;
    if (!agent.created_at) agent.created_at = ts;
    addAgent(agent);
    return { type: 'agent', item: agent };
  }
  if (json.skill_config) {
    const skill = json.skill_config as SkillConfig;
    if (!skill.id) skill.id = `skill_${ts}`;
    if (!skill.created_at) skill.created_at = ts;
    addSkill(skill);
    return { type: 'skill', item: skill };
  }
  if (json.tool_config) {
    const tool = json.tool_config as ToolConfig;
    if (!tool.id) tool.id = `tool_${ts}`;
    if (!tool.created_at) tool.created_at = ts;
    addTool(tool);
    return { type: 'tool', item: tool };
  }
  if (json.memory_config) {
    const memory = json.memory_config as MemoryConfig;
    if (!memory.id) memory.id = `memory_${ts}`;
    if (!memory.created_at) memory.created_at = ts;
    addMemory(memory);
    return { type: 'memory', item: memory };
  }
  if (json.pipeline) {
    const pipeline = json.pipeline as MASPipeline;
    if (!pipeline.id) pipeline.id = `pipeline_${ts}`;
    if (!pipeline.created_at) pipeline.created_at = ts;
    addPipeline(pipeline);
    return { type: 'pipeline', item: pipeline };
  }
  return null;
};
