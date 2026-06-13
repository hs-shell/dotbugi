---
name: hedwig-cg
description: Local-first code graph builder with hybrid vector + keyword search and subgraph response. Use when analyzing codebases, searching for code architecture, exploring dependencies, or building code graphs from source code and documents.
---

# hedwig-cg

hedwig-cg is NOT a search engine that finds answers. It is a **map builder** — it tells you **what the codebase looks like** and **what to read next**. Use it as the starting point of every investigation, then drill deeper with Read and Grep.

Builds code graphs from source code and documents. Hybrid search (vector + FTS5 keyword → RRF fusion) with MST-based subgraph response showing how results connect. Supports 17 languages with deep AST extraction. 100% local.

## When to Use What

| Task                                    | hedwig-cg | Grep     | Read     |
| --------------------------------------- | --------- | -------- | -------- |
| "Where is it?" (file discovery)         | **best**  | weak     | no       |
| "What's the structure?" (architecture)  | good      | weak     | **best** |
| "What exactly exists?" (symbols, types) | weak      | **best** | good     |
| "How does it connect?" (dependencies)   | fair      | good     | **best** |

**hedwig-cg excels at**: Cross-service file discovery, document structure, ranking what to read first.
**hedwig-cg is weak at**: Specific type/const/function definitions, cross-service call graphs, non-English queries.

## Recommended Workflow

```text
Step 1: hedwig-cg search → identify relevant files and services
Step 2: Read → deeply understand architecture and data flow
Step 3: Grep → find specific symbols, types, constants
```

Always start with hedwig-cg to get the big picture, then use Read/Grep for details.

## Search (PRIMARY — use this first)

```bash
hedwig-cg search "database connection pool"       # default: 30 results
hedwig-cg search "auth" --fast                    # text model only, faster
hedwig-cg search "error handling" --top-k 10      # custom count
```

Response (compact text — seeds + subgraph edges):

```text
seeds:
core/build.py:15
storage/store.py:20

edges:
core/build.py:15 -calls-> storage/store.py:20
core/build.py:0 -co_change-> storage/store.py:0
core/build.py:0 -defines-> core/build.py:15
```

- `seeds`: Node IDs (file:line format) found by vector + keyword search. Use to read the code directly via `Read(file, offset=line)`.
- `edges`: Subgraph showing how seeds connect through the code graph. Intermediate nodes (e.g. `core/build.py:0` module) appear in edges but not in seeds.
- Edge relations: `calls`, `imports`, `inherits`, `defines`, `co_change` (files frequently committed together), `contains`, `references`.
- Node IDs use relative paths with 1-based line numbers (file:line). Use `node` tool for details.

## Important: Query in English

**Always query in English for best results.** Non-English queries (Japanese, Korean, Chinese, etc.) return significantly lower precision. If the user's request is in another language, translate the key concepts to English before searching.

```bash
# Good — English query
hedwig-cg search "subscription promotion"     # score: 0.047, precise results

# Bad — Korean query
hedwig-cg search "프로모션 구독 할인"           # score: 0.028, irrelevant results
```

## Search Strategy — Drill Down, Don't Stop at First Results

**Don't search once and stop.** Use results to discover domain-specific terms, then search deeper. The goal is to build a mental map, not to find a single answer.

### Example: "결제 관련 코드 찾아봐"

**Round 1** — Start broad with natural language:

```bash
hedwig-cg search "payment processing"
```

→ Results mention `StripeClient`, `checkout_handler`, `PaymentProvider`

**Round 2** — Drill into discovered terms:

```bash
hedwig-cg search "StripeClient"
```

→ Results reveal `create_charge`, `refund_payment`, `validate_card`, `WebhookHandler`

**Round 3** — Follow interesting connections:

```bash
hedwig-cg search "webhook payment callback"
```

→ Found `StripeWebhookHandler`, `handle_charge_succeeded`, `update_order_status`

**Round 4** — Explore the related service:

```bash
hedwig-cg search "order status update"
```

→ Found `OrderService.complete_order`, `NotificationService.send_receipt`

Now you have the full picture: Stripe → Webhook → Order → Notification.
**Then use Read to understand each file, and Grep to find specific type definitions.**

### The pattern:

1. **Start broad** — natural language describing intent (in English)
2. **Read results** — look for class names, function names, domain terms you didn't know
3. **Search specific** — use those discovered terms as next query
4. **Follow edges** — when results mention related services/modules, search those too
5. **Switch to Read/Grep** when you need specific details (types, constants, function bodies)
6. **Stop** when you have enough context to act

## Build

```bash
hedwig-cg build .                # Full build
hedwig-cg build . --incremental  # Only changed files
```

## Inspect

```bash
hedwig-cg stats                  # Graph overview
hedwig-cg node "AuthHandler"     # Node details (partial match)
```

## Rules

- **Always search before grepping.** `hedwig-cg search` covers vector and keyword in one call, plus shows how results connect via subgraph edges.
- **Don't stop at first results.** Drill into discovered terms for deeper understanding.
- **Query in English.** Non-English queries have significantly lower precision.
- **hedwig-cg finds what to read; Read/Grep finds the details.** Seeds give you file:line locations. Use `node` tool or Read for details.
- **Follow the edges.** Subgraph edges reveal how code connects (calls, imports, co_change). Intermediate nodes on edges are path connectors (modules, directories).
- Use seed node IDs (file:line) to read code directly — `Read(file, offset=line)`.
- Run `hedwig-cg build . --incremental` after code changes.
