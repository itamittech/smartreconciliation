---
name: starting-backend
description: Start and verify the SmartReconciliation Spring Boot backend locally. Use when asked to run `mvnw`/`mvnw.cmd`, resolve port 8080 conflicts, observe startup logs, and confirm the app has started even if `/actuator/health` is not exposed.
---

# Starting Backend

## Overview

Start the backend with Maven, watch startup logs for the definitive "Started ..." line, and confirm service readiness. If the health endpoint is not exposed, rely on logs and a basic HTTP response to confirm the app is running.

## Workflow

1. Start the backend
2. Observe logs until the "Started ..." line appears
3. Confirm status to the user with a clear "backend started" statement
4. If requested, check `/actuator/health` and explain 404s as "endpoint not exposed" rather than "app is down"

## Step 1: Start the Backend

Use the Maven wrapper from the repo root:

```powershell
.\mvnw.cmd spring-boot:run
```

If you need it in the background, use the provided script:

```powershell
.\.codex\skills\starting-backend\scripts\start_backend.ps1
```

## Step 2: Observe Logs

The authoritative signal that the backend is running is the Spring Boot log line containing `Started` (for example: `Started SmartReconciliationApplication ...`).

If you started in the background, use:

```powershell
Get-Content .\.tmp\backend.out.log -Tail 200
Get-Content .\.tmp\backend.err.log -Tail 200
```

## Step 3: Confirm Status

Once the `Started ...` line appears, explicitly respond: **"The backend is started."**

If `/actuator/health` returns a 404, do not say the app is down. Say: **"The app is started; the actuator health endpoint is not exposed."**

## Step 4: Port 8080 Conflicts

Only kill processes if the user explicitly asks. Then:

```powershell
Get-NetTCPConnection -LocalPort 8080 -State Listen | Select-Object -ExpandProperty OwningProcess -Unique
```

and terminate those PIDs with:

```powershell
taskkill /PID <PID> /F
```

## Resources

### scripts/

- `start_backend.ps1`: Starts the backend in the background, writes logs to `.tmp/`, waits for the "Started" line, and reports health check status.
