# Memory Pattern (memory.md)

> AI2A Agent Factory — Memory Specification Standard v2.0

Memory structures ensure **continuity, learning, and context** across agent interactions. In Multi-Agent Systems (MAS), memory governance is critical for security and coherence.

## Memory Types

### Episodic Memory
- **Purpose**: Per-session conversation history and recent context
- **Storage**: In-memory buffer, sliding window with progressive summarization
- **TTL**: Session-bound (minutes to hours)
- **Retrieval**: Recency-based
- **Use case**: Chat history, recent interactions, session context

### Semantic Memory
- **Purpose**: Long-term storage of facts, rules, user preferences, domain knowledge
- **Storage**: Vector database (Pinecone, Weaviate, ChromaDB) with embeddings
- **TTL**: Permanent or long-lived
- **Retrieval**: Relevance-based (similarity search)
- **Use case**: Knowledge base, FAQs, user profiles, learned facts

### Procedural Memory
- **Purpose**: Learned workflows, successful execution paths, best practices
- **Storage**: Graph database or structured JSON
- **TTL**: Long-lived, updated on success
- **Retrieval**: Pattern-based (match current task to known workflows)
- **Use case**: Task automation, workflow optimization, skill improvement

### Working Memory
- **Purpose**: Short-term scratchpad for active reasoning and intermediate results
- **Storage**: In-memory, context-bound
- **TTL**: Task-duration only
- **Retrieval**: Immediate (always in context)
- **Use case**: Chain-of-thought buffer, intermediate calculations, active task state

## Memory Configuration Schema

| Field | Type | Description |
|:---|:---|:---|
| `id` | string | Unique identifier (`memory_<uuid>`) |
| `name` | string | Human-readable name |
| `type` | enum | `episodic` · `semantic` · `procedural` · `working` |
| `strategy.storage` | enum | `in_memory` · `local_storage` · `vector_db` · `graph_db` · `hybrid` |
| `strategy.ttl_seconds` | int\|null | Time-to-live (null = permanent) |
| `strategy.max_entries` | int | Maximum stored entries |
| `strategy.indexing` | enum | `sequential` · `embedding` · `keyword` · `hybrid` |
| `strategy.retrieval` | enum | `recency` · `relevance` · `importance` · `combined` |

## Access Control (MAS)

| Field | Type | Description |
|:---|:---|:---|
| `readable_by` | string[] | Agent IDs that can read this memory |
| `writable_by` | string[] | Agent IDs that can write to this memory |
| `shared` | bool | Whether this memory is shared across agents |

## Governance Rules
1. Every memory MUST have TTL or explicit justification for permanence
2. Access control is MANDATORY in MAS (who reads, who writes)
3. Semantic memory MUST specify embedding model
4. Working memory MUST have size limits (prevent context overflow)
5. Shared memories MUST have conflict resolution strategy
6. Memory decay: older entries lose priority unless marked as important

## Current Implementation
| Memory | Type | Storage | Scope |
|:---|:---|:---|:---|
| Chat History | Episodic | React State | Session |
| Agent Registry | Semantic | localStorage | Persistent |
| Mode Context | Working | React State | Session |
