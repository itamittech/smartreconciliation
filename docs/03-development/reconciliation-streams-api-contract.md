# Reconciliation Streams API Contract (v1 Additive)

This document defines the additive API contract for stream-based reconciliation while preserving backward compatibility with existing reconciliation endpoints.

## 1. Contract Goals

1. Introduce stream and run APIs without breaking existing clients.
2. Keep `ApiResponse<T>` envelope style consistent with current API behavior.
3. Provide clear payload contracts for backend and frontend implementation.
4. Define explicit compatibility mapping from legacy reconciliation APIs.

## 2. Versioning and Compatibility Strategy

1. API namespace remains `/api/v1`.
2. New stream endpoints are additive; no legacy endpoint removals in this phase.
3. Existing `/api/v1/reconciliations` contract remains valid.
4. Legacy reconciliations map internally to a single-step stream run.

## 3. Shared Envelope

All responses use the existing envelope:

```json
{
  "success": true,
  "message": "Optional human-readable message",
  "data": {}
}
```

Error responses remain unchanged from existing API reference conventions.

## 4. New Endpoint Contracts

## 4.1 Create Stream

- Method: `POST`
- Path: `/api/v1/streams`

### Request

```json
{
  "name": "E-commerce Settlement Stream",
  "description": "OMS to marketplace to gateway to bank",
  "domain": "ECOMMERCE",
  "triggerType": "SCHEDULED",
  "triggerConfig": {
    "cron": "0 30 2 * * *",
    "timezone": "UTC"
  },
  "steps": [
    {
      "stepOrder": 1,
      "name": "Orders vs Marketplace",
      "sourceInput": { "type": "FILE", "id": 1001 },
      "targetInput": { "type": "FILE", "id": 1002 },
      "ruleSetId": 55,
      "config": { "continueOnFailure": false, "maxRetries": 1 }
    },
    {
      "stepOrder": 2,
      "name": "Remaining Orders vs Gateway",
      "sourceInput": { "type": "STEP_OUTPUT_UNMATCHED_SOURCE", "id": 1 },
      "targetInput": { "type": "FILE", "id": 1003 },
      "ruleSetId": 56,
      "config": { "continueOnFailure": true, "maxRetries": 2 }
    }
  ]
}
```

### Response `data`

```json
{
  "id": 9001,
  "name": "E-commerce Settlement Stream",
  "status": "ACTIVE",
  "domain": "ECOMMERCE",
  "stepCount": 2,
  "createdAt": "2026-02-21T06:00:00Z",
  "updatedAt": "2026-02-21T06:00:00Z"
}
```

## 4.2 Get Stream

- Method: `GET`
- Path: `/api/v1/streams/{streamId}`

### Response `data`

```json
{
  "id": 9001,
  "name": "E-commerce Settlement Stream",
  "description": "OMS to marketplace to gateway to bank",
  "status": "ACTIVE",
  "domain": "ECOMMERCE",
  "triggerType": "SCHEDULED",
  "triggerConfig": { "cron": "0 30 2 * * *", "timezone": "UTC" },
  "steps": [
    {
      "id": 9101,
      "stepOrder": 1,
      "name": "Orders vs Marketplace",
      "sourceInput": { "type": "FILE", "id": 1001 },
      "targetInput": { "type": "FILE", "id": 1002 },
      "ruleSetId": 55,
      "config": { "continueOnFailure": false, "maxRetries": 1 }
    }
  ],
  "createdAt": "2026-02-21T06:00:00Z",
  "updatedAt": "2026-02-21T06:10:00Z"
}
```

## 4.3 Validate Stream

- Method: `POST`
- Path: `/api/v1/streams/{streamId}/validate`

### Response `data`

```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    {
      "code": "STEP_TARGET_FILE_LARGE",
      "message": "Step 2 target file has 1.2M rows; consider schedule window."
    }
  ]
}
```

## 4.4 Create Stream Run

- Method: `POST`
- Path: `/api/v1/streams/{streamId}/runs`

### Request

```json
{
  "triggerType": "MANUAL",
  "triggerMetadata": {
    "requestedBy": "amit@company.com",
    "reason": "Month-end close run"
  }
}
```

### Response `data`

```json
{
  "runId": 9201,
  "streamId": 9001,
  "status": "PENDING",
  "currentStepOrder": 0,
  "startedAt": null,
  "createdAt": "2026-02-21T06:20:00Z"
}
```

## 4.5 Get Stream Run

- Method: `GET`
- Path: `/api/v1/stream-runs/{runId}`

### Response `data`

```json
{
  "id": 9201,
  "streamId": 9001,
  "status": "RUNNING",
  "currentStepOrder": 2,
  "metrics": {
    "totalSteps": 3,
    "completedSteps": 1,
    "failedSteps": 0,
    "matchedRecords": 142200,
    "exceptionCount": 187
  },
  "errorMessage": null,
  "startedAt": "2026-02-21T06:21:00Z",
  "completedAt": null,
  "createdAt": "2026-02-21T06:20:00Z",
  "updatedAt": "2026-02-21T06:26:00Z"
}
```

## 4.6 Get Step Runs for a Run

- Method: `GET`
- Path: `/api/v1/stream-runs/{runId}/steps`

### Response `data`

```json
[
  {
    "id": 9301,
    "runId": 9201,
    "stepId": 9101,
    "stepOrder": 1,
    "status": "COMPLETED",
    "attemptNo": 1,
    "progress": 100,
    "reconciliationId": 12001,
    "startedAt": "2026-02-21T06:21:00Z",
    "completedAt": "2026-02-21T06:23:10Z"
  },
  {
    "id": 9302,
    "runId": 9201,
    "stepId": 9102,
    "stepOrder": 2,
    "status": "IN_PROGRESS",
    "attemptNo": 1,
    "progress": 54,
    "reconciliationId": 12002,
    "startedAt": "2026-02-21T06:23:20Z",
    "completedAt": null
  }
]
```

## 4.7 Get Artifacts for Step Run

- Method: `GET`
- Path: `/api/v1/step-runs/{stepRunId}/artifacts`

### Response `data`

```json
[
  {
    "id": 9401,
    "artifactType": "UNMATCHED_SOURCE",
    "fileId": 50021,
    "filename": "stream_9201_step_1_unmatched_source.csv",
    "rowCount": 834,
    "checksum": "sha256:abc123...",
    "downloadUrl": "/api/v1/files/50021/download",
    "createdAt": "2026-02-21T06:23:11Z"
  }
]
```

## 4.8 Cancel Stream Run

- Method: `POST`
- Path: `/api/v1/stream-runs/{runId}/cancel`

### Response `data`

```json
{
  "runId": 9201,
  "status": "CANCELED",
  "completedAt": "2026-02-21T06:27:00Z"
}
```

## 5. Contract Models

## 5.1 Enums

### `StreamStatus`
- `ACTIVE`
- `PAUSED`
- `ARCHIVED`

### `RunStatus`
- `PENDING`
- `RUNNING`
- `PARTIAL_FAILED`
- `FAILED`
- `COMPLETED`
- `CANCELED`

### `StepRunStatus`
- `PENDING`
- `IN_PROGRESS`
- `RETRY_WAIT`
- `FAILED`
- `COMPLETED`
- `SKIPPED`
- `CANCELED`

### `InputType`
- `FILE`
- `STEP_OUTPUT_UNMATCHED_SOURCE`
- `STEP_OUTPUT_UNMATCHED_TARGET`
- `DATA_SOURCE_SNAPSHOT`

### `TriggerType`
- `MANUAL`
- `SCHEDULED`
- `EVENT`

## 6. Compatibility Matrix (Legacy to Stream Runtime)

| Legacy Endpoint | Legacy Behavior | Stream Runtime Mapping | Client Impact |
|---|---|---|---|
| `POST /api/v1/reconciliations` | Create pending reconciliation job | Create implicit one-step stream definition/run behind adapter | None (response contract preserved) |
| `POST /api/v1/reconciliations/{id}/start` | Start pending reconciliation | Start mapped one-step run if not already started | None |
| `GET /api/v1/reconciliations/{id}` | Retrieve reconciliation details | Resolve mapped step run + reconciliation aggregate view | None |
| `GET /api/v1/reconciliations/{id}/status` | Reconciliation status | Derived from mapped step run state | None |
| `POST /api/v1/reconciliations/{id}/cancel` | Cancel reconciliation | Cancel mapped run/step run | None |
| `GET /api/v1/reconciliations/{id}/exceptions` | List reconciliation exceptions | Unchanged; reconciliation id still valid | None |

## 7. Frontend Impact Notes

1. Existing reconciliation pages continue to operate without payload breakage.
2. New stream UX consumes additive endpoints only.
3. Shared status badge components must support new run status values.
4. New types required in `frontend/src/services/types.ts`:
   - stream definitions
   - stream runs
   - step runs
   - artifact metadata

## 8. Migration Guidance

1. Implement stream endpoints first, behind feature flag if needed.
2. Introduce compatibility adapter before changing existing reconciliation controller behavior.
3. Deploy with dual-read verification in lower environments:
   - compare legacy status and mapped stream status
   - compare exception counts and match metrics
4. Only after parity confidence should frontend stream UX be enabled by default.

## 9. Open Contract Checks Before P1 Sign-off

1. Confirm final naming for `CANCELED` vs `CANCELLED` enum in backend contracts.
2. Confirm pagination strategy for `GET /api/v1/stream-runs/{runId}/steps` for very large runs.
3. Confirm whether artifact downloads use existing file endpoints or dedicated artifact endpoints.
4. Confirm scheduler trigger schema (`cron` and timezone validation rules).

## 10. References

1. `docs/07-strategy/2026-02-21-reconciliation-platform-pivot-plan.md`
2. `docs/02-architecture/reconciliation-stream-runtime-architecture.md`
3. `docs/03-development/api-reference.md`
4. Linear issue: `SMA-179`

