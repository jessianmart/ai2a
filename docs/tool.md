# Tools Pattern (tool.md)

> AI2A Agent Factory — Tool Specification Standard v2.0

Tools are **interfaces to external services, APIs, and local resources** that agents invoke to interact with the world. Every tool is an MCP-compatible server by default.

## Tool Integration Schema

### Identity
| Field | Type | Description |
|:---|:---|:---|
| `id` | string | Unique identifier (`tool_<uuid>`) |
| `name` | string | Human-readable name |
| `version` | string | Semver |
| `description` | string | What this tool connects/does |

### Interface
| Field | Type | Description |
|:---|:---|:---|
| `interface_type` | enum | `mcp` · `rest` · `cli` · `function` · `websocket` |
| `endpoint` | string | URL, command, or function reference |
| `mcp_compatible` | bool | Whether this tool follows MCP server protocol |

### Authentication
| Field | Type | Description |
|:---|:---|:---|
| `strategy` | enum | `api_key` · `oauth2` · `session` · `none` · `mTLS` |
| `config` | Record | Auth-specific configuration (header names, token prefix, etc.) |

> **Rule**: Auth credentials MUST NEVER be hardcoded. Always reference env vars or config.

### Execution
| Field | Type | Description |
|:---|:---|:---|
| `sandbox` | bool | Whether to execute in isolated sandbox |
| `timeout_ms` | int | Hard timeout in milliseconds (NEVER infinite) |
| `retry_policy.max_retries` | int | Maximum retry attempts |
| `retry_policy.backoff_ms` | int | Backoff between retries |
| `rate_limit.requests_per_minute` | int | Rate limiting (MANDATORY for external APIs) |

### Schemas
| Field | Type | Description |
|:---|:---|:---|
| `input_schema` | Record | Typed input parameters with validation |
| `output_schema` | Record | Expected output structure |

## MCP Integration
Tools that declare `mcp_compatible: true` follow the Model Context Protocol:
- **Discovery**: Advertise capabilities via MCP server metadata
- **Invocation**: Accept structured input, return structured output
- **Capability Negotiation**: Declare supported features and limitations

## Security Principles
1. **Timeout**: Every tool MUST have a timeout (never infinite)
2. **Validation**: Input schemas MUST validate types to prevent injection
3. **Auth**: Never hardcode — always env vars or config
4. **Rate Limiting**: Mandatory for all external APIs
5. **Side Effects**: Tools that modify state MUST declare side-effects explicitly
6. **Sandbox**: Code-executing tools MUST run in isolated sandboxes

## Active Tools
| Tool | Interface | MCP | Status |
|:---|:---|:---|:---|
| Gemini-API | REST | Yes | Active |
| Mic-IO | Function | No | Active |
| LocalStorage | Function | No | Active |
| Export-Engine | Function | No | Active |
