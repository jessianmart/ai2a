# PROJECTS.md: The Strategic Memory Layer (LTM)

While `CONTEXT.md` manages the immediate session, `PROJECTS.md` acts as the "Project Manager" (LTM). It decomposes complex goals into milestones and manages long-term dependencies.

## Core Roles

1. **Work Breakdown Structure (WBS)**: Decomposes high-level objectives (e.g., "Build a Micro-SaaS") into actionable, interdependent milestones.
2. **Dependency Management**: Tracks "Blocked" vs. "In Progress" states to prevent agents from hallucinating or skipping critical steps.
3. **Cross-Session Continuity**: Ensures that if a user returns weeks later, the system remembers exactly which milestone is active.

## Structure (Example)

```yaml
project_id: PRJ-SRED-2026-Q1
client_tenant: startup-vibrant
status: IN_PROGRESS
deadline: 2026-04-15
```

### 1. Milestones (Work Tracking)

- **[COMPLETED] M1: System Integration**
    - [x] GitHub Auth linked.
    - [x] Slack Webhooks configured.
- **[IN PROGRESS] M2: Data Ingestion**
    - [x] Fetch weekly uncertainty logs.
    - [/] Categorize technical debt (Assigned: Specialist_Agent).
- **[BLOCKED] M3: Anti-Hallucination Review**
    - *Reason*: Awaiting M2 completion. (Assigned: Critical_Agent).

### 2. Long-term Knowledge
- **Conflict Resolution**: "Always prioritize SR&ED logs over generic JIRA tickets for R&D claims."

## Implementation in `ai2a`
The `PROMPT_ARCHITECT` mode uses this file to generate "Task Roadmaps". The Frontend (React) reads `PROJECTS.md` to render progress bars and status dashboards for the user.
