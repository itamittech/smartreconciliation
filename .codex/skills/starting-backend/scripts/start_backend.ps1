param(
  [string]$ProjectRoot = "D:\AmitStudy\ClaudeCode\smartreconciliation",
  [int]$Port = 8080,
  [string]$HealthUrl = "http://localhost:8080/actuator/health",
  [switch]$KillPort
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ($KillPort) {
  $pids = Get-NetTCPConnection -LocalPort $Port -State Listen | Select-Object -ExpandProperty OwningProcess -Unique
  if ($pids) {
    foreach ($procId in $pids) {
      taskkill /PID $procId /F | Out-Null
    }
  }
}

$logDir = Join-Path $ProjectRoot ".tmp"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$out = Join-Path $logDir "backend.out.log"
$err = Join-Path $logDir "backend.err.log"
Remove-Item -Force $out -ErrorAction SilentlyContinue
Remove-Item -Force $err -ErrorAction SilentlyContinue

Start-Process -FilePath (Join-Path $ProjectRoot "mvnw.cmd") -ArgumentList "spring-boot:run" -WorkingDirectory $ProjectRoot -RedirectStandardOutput $out -RedirectStandardError $err -WindowStyle Hidden

$started = $false
$deadline = (Get-Date).AddMinutes(2)
while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds 2
  if (Test-Path $out) {
    if (Select-String -Path $out -Pattern "Started" -Quiet) {
      $started = $true
      break
    }
  }
  if (Test-Path $err) {
    if (Select-String -Path $err -Pattern "Started" -Quiet) {
      $started = $true
      break
    }
  }
}

$health = "DOWN"
try {
  $resp = Invoke-WebRequest -UseBasicParsing $HealthUrl
  $health = "$($resp.StatusCode)"
} catch {
  $health = "DOWN"
}

if ($started) {
  Write-Output "STARTED"
  Write-Output "health=$health"
} else {
  Write-Output "NOT_STARTED"
  Write-Output "health=$health"
}
