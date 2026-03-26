# Skills Pattern (skills.md)

> AI2A Agent Factory — Skill Specification Standard v2.0

Skills are **atomic, composable units of capability** assigned to agents. They follow the lazy-loading pattern: the orchestrator reads only the YAML frontmatter to decide activation; the full body is loaded only when triggered.

## Skill Definition Schema

### Metadata (YAML Frontmatter)
```yaml
---
name: "skill_name"
id: "skill_<uuid>"
version: "1.0.0"
description: "What this skill does"
category: "analysis|generation|integration|validation|transformation"
allowed_tools: ["tool_id_1", "tool_id_2"]
tags: ["domain", "type"]
---
```

### Activation
| Field | Type | Description |
|:---|:---|:---|
| `triggers` | string[] | Explicit conditions that activate this skill |
| `parameters` | Record | Typed input parameters with `type`, `required`, `description` |
| `preconditions` | string[] | Conditions that MUST be true before execution |

### Requirements
| Field | Type | Description |
|:---|:---|:---|
| `languages` | string[] | Runtime languages (`python3`, `javascript`, `typescript`) |
| `libraries` | string[] | Required packages/modules |
| `apis` | string[] | External APIs consumed |

### Implementation
| Field | Type | Description |
|:---|:---|:---|
| `type` | enum | `python` · `javascript` · `typescript` · `pseudo` · `prompt_chain` |
| `code` | string | Complete implementation code |
| `steps` | string[] | Numbered execution steps with clear purpose |
| `dependencies` | string[] | Other skill IDs this skill depends on |

### Output
| Field | Type | Description |
|:---|:---|:---|
| `format` | enum | `json` · `text` · `markdown` · `structured` |
| `schema` | Record | Output field names and types |
| `confidence_required` | float | Minimum confidence score (0–1) to accept result |

## Design Principles
1. **Pure Functions**: Defined input → predictable output, no hidden side-effects
2. **Confidence Scoring**: Every skill MUST return a confidence score with its result
3. **Composability**: Skills can chain — output of one feeds input of another
4. **Idempotence**: Same input → same output (when possible)
5. **Error Boundaries**: Every skill defines fallback behavior on failure

## Global Skills Library
- [ ] **WebResearch**: Autonomous search, multi-source synthesis, citation
- [ ] **CodeRefactor**: AST analysis, pattern detection, safe transformation
- [ ] **DataViz**: Schema inference, chart selection, rendering
- [ ] **ContentGeneration**: Multi-format content with brand voice compliance
- [ ] **DataExtraction**: Structured extraction from unstructured sources
- [ ] **SentimentAnalysis**: Multi-language sentiment with confidence scoring
