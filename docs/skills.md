# SKILL.md: Elite Capabilities Layer

Skills are the specialized tools and protocols that give an Agent "Muscles". In an advanced AOS, skills are consumed via **Dynamic Tooling (API/MCP)** rather than being hardcoded in prompts.

## Professional Skill Patterns (Senior-Level)

### 1. Unified Tool Call (Tool-Use API)
Standardize all tool interactions using the `tool_use` block pattern. This ensures compatibility across different models (Claude, GPT, Gemini).

```json
{
  "type": "tool_use",
  "id": "toolu_01A0224...",
  "name": "search_filesystem",
  "input": { "query": "*.ts", "path": "./src" }
}
```

### 2. Capability Multi-Threading
When an agent requires multiple skills (e.g., "Analyze DB AND Search Web"), the **Skill Middleware** should handle parallel tool execution to minimize user-perceived latency.

### 3. Verification & Mocking
- **In Development**: Use Mock MCP servers to simulate skill responses.
- **In Production**: Enforce `strict_schema` validation at the middleware level.

## Orchestration Logic
Skills shouldn't just be "available". They must be "Activated" based on the agent's current mission in `AGENTS.md`.

- **Auto-Discovery**: Agents query the MCP Middleware to see what skills are online.
- **Confidence Scoring**: Skills must report their internal confidence (e.g., a regex skill is 1.0, an LLM-based summarizer skill might be 0.85).

## Implementation in `ai2a`
The `PROMPT_ARCHITECT` mode generates the required system prompts to enable efficient tool discovery. The `SKILL_ARCHITECT` mode compiles these definitions into a unified `skill_registry`.
