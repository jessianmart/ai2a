# CONTEXT.md: The Dynamic Memory Layer (RAM)

The `CONTEXT.md` file is the "RAM" of the Agentic Operating System (AOS). It handles real-time session state, preventing "IA Myopia" and ensuring seamless Multi-Agent System (MAS) coordination.

## Core Roles

1. **Shared Whiteboard (MAS Hand-off)**: In a MAS, agents write results to `CONTEXT.md`. The next agent in the pipeline reads from it to resume the workflow.
2. **Session Persistence**: Maintains the "State Window", preventing repetitive loops and ensuring the system learns from immediate errors.
3. **User Signals**: Captures real-time Human-in-the-Loop (HITL) feedback, preferences, and system events.

## Structure (Example)

```yaml
session_id: SES-99-ALPHA
current_step: 3 / 5
last_agent: Auditor_Agent
status: WAITING_FOR_USER_APPROVAL
```

### 1. Active Workflow State
- **Goal**: Preparing Canadian T2 Corporate Tax Return.
- **Micro-tasks**:
    - [x] OCR Receipt Processing.
    - [x] Bank Statement Analysis.
    - [/] ITC Identification (Current).
    - [ ] Final Audit.

### 2. Immediate Session Logs
- `22:15`: `Executor_Agent` processed 15 PDFs. 2 flagged for low confidence.
- `22:18`: `Validator_Agent` cross-referenced Shopify API. Discrepancy found in line 16.

### 3. Feedback Loops
- **User Preference**: "Treat all Uber expenses as Business unless specified otherwise." (Applied for current session).

## Implementation in `ai2a`
In the React/TypeScript services, the `StateManager` service dynamically updates this file via MCP to ensure the `GeminiService` always has the latest "Short-term Memory".
