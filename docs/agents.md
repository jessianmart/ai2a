# Agents Pattern (agents.md)

> AI2A Agent Factory — Agent Specification Standard v2.0

## Agent Specification Schema

Every agent MUST define:

### Identity
- **ID**: Unique identifier (`agent_<uuid>`)
- **Name**: Human-readable name
- **Version**: Semver (`1.0.0`)
- **Mission**: North Star objective — the single metric this agent optimizes for

### DNA (Cognitive Profile)
| Field | Type | Description |
|:---|:---|:---|
| `archetype` | enum | `executor` · `validator` · `critic` · `researcher` · `strategist` · `specialist` · `coordinator` · `monitor` |
| `tone` | string | Communication style (e.g., "analytical and precise", "creative and bold") |
| `autonomy` | enum | `full` · `supervised` · `reactive` · `collaborative` |
| `confidence_threshold` | float | 0–1. Below this, the agent MUST escalate |
| `reasoning_style` | enum | `chain_of_thought` · `tree_of_thought` · `react` · `reflexion` |

### Hierarchy (MAS Position)
| Field | Type | Description |
|:---|:---|:---|
| `parent` | string\|null | Parent agent ID (null = root) |
| `sub_agents` | string[] | IDs of agents this agent can delegate to |
| `peers` | string[] | IDs of agents at the same level |
| `communication` | enum | `a2a` · `mcp` · `broadcast` · `pub_sub` · `p2p` |

### Guardrails
| Field | Type | Description |
|:---|:---|:---|
| `max_iterations` | int | Maximum reasoning loops before forced stop |
| `timeout_seconds` | int | Hard timeout for any operation |
| `forbidden_actions` | string[] | Actions the agent MUST NEVER take |
| `escalation_rules` | string[] | Conditions that trigger escalation to parent/human |
| `anti_hallucination` | bool | Whether to activate Executor→Validator→Critic triad |

### Associations
- **Tools**: List of `tool_<id>` this agent can invoke
- **Skills**: List of `skill_<id>` this agent can execute
- **Memory Strategy**: Which memory types this agent uses (`episodic`, `semantic`, `procedural`, `working`)

### System Prompt
The complete system prompt (>= 500 words) following the structure:
1. `[IDENTIDADE]` — Who, mission, North Star
2. `[CONHECIMENTO]` — Domain expertise
3. `[PROTOCOLOS]` — Behavioral rules
4. `[GUARDRAILS]` — Limits and escalation
5. `[OUTPUT]` — Expected output format

## Anti-Hallucination Triad
For critical domains, every agent chamber MUST have:
- **Executor**: Performs the task
- **Validator**: Verifies correctness and consistency
- **Critic**: Challenges assumptions, looks for edge cases

## Registry
| Agent Name | Role | Archetype | Autonomy | Status |
|:---|:---|:---|:---|:---|
| Agent Architect Prime | Agent Creator | strategist | full | Core |
| Skill Architect Prime | Skill Compiler | specialist | full | Core |
| Tool Architect Prime | Tool Integrator | specialist | full | Core |
| Memory Architect Prime | Memory Designer | specialist | full | Core |
| System Orchestrator Prime | Task Coordinator | coordinator | full | Core |
| MAS Pipeline Architect | System Builder | strategist | full | Core |
