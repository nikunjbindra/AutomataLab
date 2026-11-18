# AutomataLab REST API Reference

> Version 1.0 — Phase 2

## Base URL

```
http://localhost:3001/api
```

> [!NOTE]
> The Vite dev-server proxy forwards `/api/**` requests from `http://localhost:5173` to `http://localhost:3001` during development.

---

## Authentication

No authentication is required for Phase 2. All endpoints are public.

---

## Common Response Envelope

Every successful response is wrapped in a consistent envelope:

```json
{
  "success": true,
  "data": { ... }
}
```

Every error response:

```json
{
  "success": false,
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": { ... }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK — resource retrieved or operation succeeded |
| 201  | Created — resource created successfully |
| 400  | Bad Request — validation error or malformed JSON |
| 404  | Not Found — resource does not exist |
| 500  | Internal Server Error — unexpected server failure |

### Error Codes

| Code | Trigger |
|------|---------|
| `VALIDATION_ERROR` | Zod schema validation failed (field-level details included) |
| `NOT_FOUND` | Requested resource ID does not exist |
| `MALFORMED_JSON` | Request body contains invalid JSON syntax |
| `INTERNAL_ERROR` | Unexpected server or database error |

---

## Endpoints

### Health

#### `GET /api/health`

Returns server status and uptime.

**Response 200**
```json
{
  "status": "ok",
  "service": "automatalab-api",
  "version": "0.1.0",
  "uptime": 42.5
}
```

---

### Machines

#### `GET /api/machines`

List all saved machine definitions, ordered by most recently updated.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `"mealy" \| "moore"` | Filter by machine type (optional) |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "preset-mandatory-task6",
      "name": "Task 6 Mandatory Example — Mealy",
      "description": "...",
      "type": "mealy",
      "machineData": {
        "states": ["A", "B"],
        "alphabet": ["0", "1"],
        "outputAlphabet": ["x", "y"],
        "initialState": "A",
        "transitions": [
          { "fromState": "A", "inputSymbol": "0", "toState": "A", "outputSymbol": "x" },
          { "fromState": "A", "inputSymbol": "1", "toState": "B", "outputSymbol": "y" },
          { "fromState": "B", "inputSymbol": "0", "toState": "A", "outputSymbol": "y" },
          { "fromState": "B", "inputSymbol": "1", "toState": "B", "outputSymbol": "x" }
        ]
      },
      "createdAt": 1700000000000,
      "updatedAt": 1700000000000
    }
  ]
}
```

---

#### `GET /api/machines/:id`

Retrieve a single machine by its UUID.

**Response 200** — same shape as a single item in the list above.

**Response 404**
```json
{
  "success": false,
  "error": "Machine not found",
  "code": "NOT_FOUND"
}
```

---

#### `POST /api/machines`

Persist a new machine definition.

**Request Body** (Mealy example)
```json
{
  "name": "My Mealy Machine",
  "description": "Optional description",
  "type": "mealy",
  "states": ["A", "B"],
  "alphabet": ["0", "1"],
  "outputAlphabet": ["x", "y"],
  "initialState": "A",
  "transitions": [
    { "fromState": "A", "inputSymbol": "0", "toState": "A", "outputSymbol": "x" },
    { "fromState": "A", "inputSymbol": "1", "toState": "B", "outputSymbol": "y" },
    { "fromState": "B", "inputSymbol": "0", "toState": "A", "outputSymbol": "y" },
    { "fromState": "B", "inputSymbol": "1", "toState": "B", "outputSymbol": "x" }
  ]
}
```

**Request Body** (Moore example)
```json
{
  "name": "My Moore Machine",
  "type": "moore",
  "states": ["even", "odd"],
  "alphabet": ["0", "1"],
  "outputAlphabet": ["0", "1"],
  "initialState": "even",
  "stateOutputs": { "even": "0", "odd": "1" },
  "transitions": [
    { "fromState": "even", "inputSymbol": "0", "toState": "even" },
    { "fromState": "even", "inputSymbol": "1", "toState": "odd" },
    { "fromState": "odd", "inputSymbol": "0", "toState": "odd" },
    { "fromState": "odd", "inputSymbol": "1", "toState": "even" }
  ]
}
```

**Response 201**
```json
{
  "success": true,
  "data": { "id": "...", "name": "My Mealy Machine", ... }
}
```

**Response 400** (initial state not in states list)
```json
{
  "success": false,
  "error": "Machine validation failed",
  "code": "VALIDATION_ERROR",
  "details": { "initialState": ["Initial state 'q99' is not in the states list"] }
}
```

---

#### `PUT /api/machines/:id`

Replace a machine definition completely. Existing states and transitions are deleted and re-inserted transactionally.

**Request Body** — same schema as `POST /api/machines`.

**Response 200**
```json
{
  "success": true,
  "data": { "id": "...", "name": "Updated name", ... }
}
```

**Response 404** — machine does not exist.

---

#### `DELETE /api/machines/:id`

Delete a machine and cascade-delete its states, transitions, and test cases.

**Response 200**
```json
{
  "success": true,
  "message": "Machine deleted successfully"
}
```

**Response 404** — machine does not exist.

---

### Conversions

#### `POST /api/conversions`

Convert a machine definition. Saves the conversion run to history.
Accepts both saved and unsaved machine definitions.

**Request Body**
```json
{
  "sourceMachine": { ... },
  "targetType": "moore",
  "options": { "removeUnreachable": true }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `sourceMachine` | `MealyMachine \| MooreMachine` | Full machine definition |
| `targetType` | `"moore" \| "mealy"` | Conversion direction |
| `options.removeUnreachable` | `boolean` | Remove unreachable states from result (default: `true`) |

**Response 200** (Mealy → Moore)
```json
{
  "success": true,
  "data": {
    "id": "conv-uuid-...",
    "success": true,
    "sourceType": "mealy",
    "targetType": "moore",
    "resultMachine": {
      "type": "moore",
      "states": ["S", "A_x", "A_y", "B_x", "B_y"],
      "alphabet": ["0", "1"],
      "outputAlphabet": ["x", "y", "ε"],
      "initialState": "S",
      "stateOutputs": { "S": "ε", "A_x": "x", "A_y": "y", "B_x": "x", "B_y": "y" },
      "transitions": [ ... ]
    },
    "steps": [ ... ],
    "metrics": { "sourceStateCount": 2, "resultStateCount": 5 }
  }
}
```

**Canonical alias routes:**
- `POST /api/convert/mealy-to-moore` — `targetType` is implied as `"moore"`; body is the Mealy machine directly
- `POST /api/convert/moore-to-mealy` — `targetType` is implied as `"mealy"`; body is the Moore machine directly

---

#### `GET /api/conversions`

List recent conversion history (last 50 runs).

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv-uuid-...",
      "sourceType": "mealy",
      "targetType": "moore",
      "createdAt": 1700000000000
    }
  ]
}
```

---

#### `GET /api/conversions/:id`

Retrieve a specific conversion run including full result machine and steps.

**Response 200** — full conversion run record.
**Response 404** — run does not exist.

---

### Simulations

#### `POST /api/simulations`

Simulate a machine on an input string. Saves the simulation run to history.

**Request Body**
```json
{
  "machine": { ... },
  "inputString": "1100"
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "sim-uuid-...",
    "machineType": "mealy",
    "inputTape": "1100",
    "outputTape": "yxyx",
    "finalState": "A",
    "accepted": true,
    "steps": [
      { "step": 0, "state": "A", "input": null, "output": null },
      { "step": 1, "state": "B", "input": "1", "output": "y" },
      { "step": 2, "state": "B", "input": "1", "output": "x" },
      { "step": 3, "state": "A", "input": "0", "output": "y" },
      { "step": 4, "state": "A", "input": "0", "output": "x" }
    ]
  }
}
```

**Canonical alias:** `POST /api/simulate`

---

#### `GET /api/simulations`

List recent simulation history (last 50 runs).

---

#### `GET /api/simulations/:id`

Retrieve a specific simulation run.

---

### Validations

#### `POST /api/validations`

Validate a machine definition without persisting it.

**Request Body** — a full machine definition (Mealy or Moore).

**Response 200** (valid)
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": []
  }
}
```

**Response 200** (invalid — note: HTTP 200, errors in body)
```json
{
  "success": true,
  "data": {
    "isValid": false,
    "errors": ["Initial state 'q99' is not in the states list"],
    "warnings": ["State 'q1' is unreachable"]
  }
}
```

---

### Equivalence Verification

#### `POST /api/verify-equivalence`

Verify behavioral equivalence between two machines using product-machine state exploration (exhaustive for complete finite transducers) plus bounded exhaustive testing.

**Request Body**
```json
{
  "machineA": { ... },
  "machineB": { ... },
  "maxDepth": 10
}
```

| Field | Type | Description |
|-------|------|-------------|
| `machineA` | `MealyMachine \| MooreMachine` | First machine |
| `machineB` | `MealyMachine \| MooreMachine` | Second machine |
| `maxDepth` | `number` | Bounded test depth (default: `10`) |

**Response 200** (equivalent)
```json
{
  "success": true,
  "data": {
    "isEquivalent": true,
    "checkedStatesCount": 10,
    "counterexample": null
  }
}
```

**Response 200** (non-equivalent)
```json
{
  "success": true,
  "data": {
    "isEquivalent": false,
    "checkedStatesCount": 1,
    "counterexample": {
      "inputString": "0",
      "outputA": "x",
      "outputB": "y"
    }
  }
}
```

**Canonical alias:** `POST /api/verifications`

---

## Error Response Reference

### Validation Error (400)
```json
{
  "success": false,
  "error": "Machine validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "initialState": ["Initial state 'q99' is not in the states list"],
    "transitions": ["Transition fromState 'missing' is not a defined state"]
  }
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Machine not found",
  "code": "NOT_FOUND"
}
```

### Malformed JSON (400)
```json
{
  "success": false,
  "error": "Invalid JSON in request body",
  "code": "MALFORMED_JSON"
}
```

### Internal Error (500)
```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## Setup and Development

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:generate --workspace=@automatalab/api
npm run db:migrate --workspace=@automatalab/api

# Seed preset machines
npm run db:seed --workspace=@automatalab/api

# Start the API server (port 3001)
npm run dev --workspace=@automatalab/api

# Run integration tests
npm run test --workspace=@automatalab/api
```

---

## Route Summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/machines` | List machines |
| GET | `/api/machines/:id` | Get machine by ID |
| POST | `/api/machines` | Create machine |
| PUT | `/api/machines/:id` | Update machine |
| DELETE | `/api/machines/:id` | Delete machine |
| POST | `/api/conversions` | Convert machine (generic) |
| GET | `/api/conversions` | List conversion history |
| GET | `/api/conversions/:id` | Get conversion run |
| POST | `/api/convert/mealy-to-moore` | Convert Mealy → Moore (alias) |
| POST | `/api/convert/moore-to-mealy` | Convert Moore → Mealy (alias) |
| POST | `/api/simulations` | Simulate machine |
| GET | `/api/simulations` | List simulation history |
| GET | `/api/simulations/:id` | Get simulation run |
| POST | `/api/simulate` | Simulate machine (alias) |
| POST | `/api/validations` | Validate machine definition |
| POST | `/api/verify-equivalence` | Verify equivalence |
| POST | `/api/verifications` | Verify equivalence (alias) |
