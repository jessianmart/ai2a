import { AgentConfig, SkillConfig, ToolConfig, MemoryConfig, MASPipeline, RegistryState, AOSOrganization, Department } from '../types';

// ============================================================================
// Export Engine — Generates production-ready .md files from registry configs
// ============================================================================

const timestamp = () => new Date().toISOString().split('T')[0];

export const exportAgentMd = (agent: AgentConfig): string => {
  return `---
name: "${agent.name}"
id: "${agent.id}"
version: "${agent.version}"
archetype: "${agent.dna.archetype}"
autonomy: "${agent.dna.autonomy}"
reasoning: "${agent.dna.reasoning_style}"
confidence_threshold: ${agent.dna.confidence_threshold}
communication: "${agent.hierarchy.communication}"
tags: [${agent.tags.map(t => `"${t}"`).join(', ')}]
generated: "${timestamp()}"
generator: "AI2A Agent Factory"
---

# ${agent.name}

## Mission (North Star)
${agent.mission}

## DNA
| Property | Value |
|:---|:---|
| Archetype | \`${agent.dna.archetype}\` |
| Tone | ${agent.dna.tone} |
| Autonomy | \`${agent.dna.autonomy}\` |
| Reasoning Style | \`${agent.dna.reasoning_style}\` |
| Confidence Threshold | \`${agent.dna.confidence_threshold}\` |

## Specialization
${agent.specialization}

## Hierarchy
- **Parent**: ${agent.hierarchy.parent || 'None (Root Agent)'}
- **Sub-agents**: ${agent.hierarchy.sub_agents.length > 0 ? agent.hierarchy.sub_agents.join(', ') : 'None'}
- **Peers**: ${agent.hierarchy.peers.length > 0 ? agent.hierarchy.peers.join(', ') : 'None'}
- **Protocol**: \`${agent.hierarchy.communication}\`

## Tools
${agent.tools.map(t => `- \`${t}\``).join('\n')}

## Skills
${agent.skills.map(s => `- \`${s}\``).join('\n')}

## Memory Strategy
${agent.memory_strategy.map(m => `- \`${m}\``).join('\n')}

## Guardrails
| Rule | Value |
|:---|:---|
| Max Iterations | ${agent.guardrails.max_iterations} |
| Timeout | ${agent.guardrails.timeout_seconds}s |
| Anti-Hallucination | ${agent.guardrails.anti_hallucination ? 'Enabled' : 'Disabled'} |

### Forbidden Actions
${agent.guardrails.forbidden_actions.length > 0 ? agent.guardrails.forbidden_actions.map(a => `- ${a}`).join('\n') : '- None defined'}

### Escalation Rules
${agent.guardrails.escalation_rules.map(r => `- ${r}`).join('\n')}

## System Prompt
\`\`\`
${agent.system_prompt}
\`\`\`
`;
};

export const exportSkillMd = (skill: SkillConfig): string => {
  return `---
name: "${skill.name}"
id: "${skill.id}"
version: "${skill.version}"
category: "${skill.category}"
allowed_tools: [${skill.requirements.libraries.map(l => `"${l}"`).join(', ')}]
tags: [${skill.tags.map(t => `"${t}"`).join(', ')}]
generated: "${timestamp()}"
generator: "AI2A Agent Factory"
---

# ${skill.name}

## Description
${skill.description}

## Activation
### Triggers
${skill.activation.triggers.map(t => `- \`${t}\``).join('\n')}

### Parameters
${Object.entries(skill.activation.parameters).map(([k, v]) =>
  `| \`${k}\` | \`${v.type}\` | ${v.required ? 'Required' : 'Optional'} | ${v.description} |`
).join('\n')}

### Preconditions
${skill.activation.preconditions.map(p => `- ${p}`).join('\n')}

## Requirements
- **Languages**: ${skill.requirements.languages.join(', ')}
- **Libraries**: ${skill.requirements.libraries.join(', ')}
- **APIs**: ${skill.requirements.apis.join(', ')}

## Implementation
**Type**: \`${skill.implementation.type}\`

### Steps
${skill.implementation.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

### Code
\`\`\`${skill.implementation.type}
${skill.implementation.code}
\`\`\`

## Output
- **Format**: \`${skill.output.format}\`
- **Confidence Required**: \`${skill.output.confidence_required}\`

### Schema
${Object.entries(skill.output.schema).map(([k, v]) => `| \`${k}\` | \`${v}\` |`).join('\n')}

## Allowed Agents
${skill.allowed_agents.map(a => `- \`${a}\``).join('\n')}
`;
};

export const exportToolMd = (tool: ToolConfig): string => {
  return `---
name: "${tool.name}"
id: "${tool.id}"
version: "${tool.version}"
interface: "${tool.interface_type}"
mcp_compatible: ${tool.mcp_compatible}
tags: [${tool.tags.map(t => `"${t}"`).join(', ')}]
generated: "${timestamp()}"
generator: "AI2A Agent Factory"
---

# ${tool.name}

## Description
${tool.description}

## Interface
- **Type**: \`${tool.interface_type}\`
- **Endpoint**: \`${tool.endpoint}\`
- **MCP Compatible**: ${tool.mcp_compatible ? 'Yes' : 'No'}

## Authentication
- **Strategy**: \`${tool.auth.strategy}\`
${Object.entries(tool.auth.config).map(([k, v]) => `- **${k}**: \`${v}\``).join('\n')}

## Execution
| Config | Value |
|:---|:---|
| Sandbox | ${tool.execution.sandbox ? 'Yes' : 'No'} |
| Timeout | ${tool.execution.timeout_ms}ms |
| Max Retries | ${tool.execution.retry_policy.max_retries} |
| Backoff | ${tool.execution.retry_policy.backoff_ms}ms |
| Rate Limit | ${tool.execution.rate_limit.requests_per_minute} req/min |

## Input Schema
${Object.entries(tool.input_schema).map(([k, v]) =>
  `| \`${k}\` | \`${v.type}\` | ${v.required ? 'Required' : 'Optional'} | ${v.description} |`
).join('\n')}

## Output Schema
${Object.entries(tool.output_schema).map(([k, v]) => `| \`${k}\` | \`${v}\` |`).join('\n')}
`;
};

export const exportMemoryMd = (memory: MemoryConfig): string => {
  return `---
name: "${memory.name}"
id: "${memory.id}"
type: "${memory.type}"
storage: "${memory.strategy.storage}"
tags: [${memory.tags.map(t => `"${t}"`).join(', ')}]
generated: "${timestamp()}"
generator: "AI2A Agent Factory"
---

# ${memory.name}

## Description
${memory.description}

## Type
\`${memory.type}\`

## Strategy
| Config | Value |
|:---|:---|
| Storage | \`${memory.strategy.storage}\` |
| TTL | ${memory.strategy.ttl_seconds ? `${memory.strategy.ttl_seconds}s` : 'Permanent'} |
| Max Entries | ${memory.strategy.max_entries} |
| Indexing | \`${memory.strategy.indexing}\` |
| Retrieval | \`${memory.strategy.retrieval}\` |

## Schema
${Object.entries(memory.schema).map(([k, v]) => `| \`${k}\` | \`${v}\` |`).join('\n')}

## Access Control
- **Readable by**: ${memory.access_control.readable_by.join(', ') || 'All'}
- **Writable by**: ${memory.access_control.writable_by.join(', ') || 'All'}
- **Shared**: ${memory.access_control.shared ? 'Yes' : 'No'}
`;
};

export const exportOrganizationMd = (org: AOSOrganization): string => {
  const deptList = org.departments.map(d =>
    `| **${d.name}** | \`${d.type}\` | ${d.human_owner} | ${d.swarms.length} swarms | ${d.operates_24_7 ? '24/7' : 'Business hours'} |`
  ).join('\n');

  const humanTeam = org.human_team.map(h =>
    `| **${h.role}** | ${h.strategic_mandate} | ${h.core_competencies.slice(0, 3).join(', ')} |`
  ).join('\n');

  const escalations = org.global_escalation_triggers.map(e =>
    `- **${e.type}**: ${e.description} → escalates to \`${e.escalates_to}\`, timeout ${e.timeout_minutes}min`
  ).join('\n');

  const totalAgents = org.departments.reduce((t, d) =>
    t + d.swarms.reduce((s, sw) => s + 1 + sw.specialist_agents.length, 0), 0);

  return `---
name: "${org.name}"
id: "${org.id}"
industry: "${org.industry}"
departments: ${org.departments.length}
total_agents: ${totalAgents}
communication_backbone: "${org.communication_backbone}"
anti_hallucination: ${org.anti_hallucination_policy.enabled}
generated: "${timestamp()}"
generator: "AI2A Agent Factory"
---

# ${org.name}
> *${org.industry} — AI-Native Organization (AOS v3)*

## Vision
${org.vision}

## Human Team (${org.human_team.length} people)
| Role | Strategic Mandate | Core Competencies |
|:---|:---|:---|
${humanTeam}

## Departments (${org.departments.length})
| Department | Type | Owner | Swarms | Schedule |
|:---|:---|:---|:---|:---|
${deptList}

**Total Agent Workforce**: ${totalAgents} specialized agents

## Anti-Hallucination Policy
- **Enabled**: ${org.anti_hallucination_policy.enabled}
- **Scope**: ${org.anti_hallucination_policy.applies_to.join(', ')}
- **Min Validators**: ${org.anti_hallucination_policy.min_validators} per critical operation

## Global KPIs
| Metric | Target | Alert Threshold |
|:---|:---|:---|
| Model Confidence | ${org.global_kpis.model_confidence.target} | < ${org.global_kpis.model_confidence.alert_below} |
| MTTR | ${org.global_kpis.mttr_seconds.target}s | > ${org.global_kpis.mttr_seconds.alert_above}s |
| Token Cost/Result | $${org.global_kpis.token_cost_per_result.target_usd} | > $${org.global_kpis.token_cost_per_result.alert_above_usd} |
| Hallucination Rate | ${(org.global_kpis.hallucination_rate.target * 100).toFixed(1)}% | > ${(org.global_kpis.hallucination_rate.alert_above * 100).toFixed(1)}% |

## Global Escalation Triggers
${escalations}

## Department Details
${org.departments.map(d => exportDepartmentMd(d)).join('\n\n---\n\n')}
`;
};

export const exportDepartmentMd = (dept: Department): string => {
  const swarmList = dept.swarms.map(sw => {
    const specNames = sw.specialist_agents.map(a => a.name).join(', ');
    return `### ${sw.name}\n- **Manager**: ${sw.manager_agent.name}\n- **Specialists**: ${specNames}\n- **KPI Target Confidence**: ${sw.kpis.model_confidence.target}\n- **MTTR Target**: ${sw.kpis.mttr_seconds.target}s\n- **Anti-hallucination**: Executor=\`${sw.moe_chamber.anti_hallucination_triad.executor}\` → Validator=\`${sw.moe_chamber.anti_hallucination_triad.validator}\` → Critic=\`${sw.moe_chamber.anti_hallucination_triad.critic}\``;
  }).join('\n\n');

  const escalations = dept.escalation_triggers.map(e =>
    `- **${e.type}**: \`${e.condition}\` → ${e.escalates_to} (timeout: ${e.timeout_minutes}min)`
  ).join('\n');

  return `## Department: ${dept.name}
- **Type**: \`${dept.type}\`
- **Human Owner**: \`${dept.human_owner}\`
- **Mission**: ${dept.mission}
- **Topology**: \`${dept.communication_topology}\`
- **24/7 Operation**: ${dept.operates_24_7}

### Swarms
${swarmList}

### Escalation Triggers
${escalations}
`;
};

export const exportFullSystem = (state: RegistryState): string => {
  const totalItems = state.agents.length + state.skills.length + state.tools.length +
    state.memories.length + state.pipelines.length +
    (state.organizations?.length ?? 0) + (state.departments?.length ?? 0);

  const sections: string[] = [
    `# AI2A — Full System Export`,
    `> Generated: ${timestamp()} | Generator: AI2A Agent Factory v3`,
    `> Organizations: ${state.organizations?.length ?? 0} | Departments: ${state.departments?.length ?? 0} | Agents: ${state.agents.length} | Skills: ${state.skills.length} | Tools: ${state.tools.length} | Memories: ${state.memories.length}`,
    `> Total items: ${totalItems}`,
    '',
    '---',
    '',
  ];

  if ((state.organizations?.length ?? 0) > 0) {
    sections.push('# ORGANIZATIONS (AOS)\n');
    state.organizations.forEach(o => sections.push(exportOrganizationMd(o), '\n---\n'));
  }
  if ((state.departments?.length ?? 0) > 0) {
    sections.push('# DEPARTMENTS\n');
    state.departments.forEach(d => sections.push(exportDepartmentMd(d), '\n---\n'));
  }
  if (state.agents.length > 0) {
    sections.push('# AGENTS\n');
    state.agents.forEach(a => sections.push(exportAgentMd(a), '\n---\n'));
  }
  if (state.skills.length > 0) {
    sections.push('# SKILLS\n');
    state.skills.forEach(s => sections.push(exportSkillMd(s), '\n---\n'));
  }
  if (state.tools.length > 0) {
    sections.push('# TOOLS\n');
    state.tools.forEach(t => sections.push(exportToolMd(t), '\n---\n'));
  }
  if (state.memories.length > 0) {
    sections.push('# MEMORIES\n');
    state.memories.forEach(m => sections.push(exportMemoryMd(m), '\n---\n'));
  }

  return sections.join('\n');
};

/**
 * Download content as a file in the browser.
 */
export const downloadFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
