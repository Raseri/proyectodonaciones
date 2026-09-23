$ErrorActionPreference = 'Stop'

$projectPath = 'C:\Users\sanju\proyectodonaciones'
$targetUrl = 'http://localhost:3000'
$reportDir = Join-Path $projectPath 'reports'
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null

Write-Host 'Comprobando si el backend está levantado...'
try {
    $health = Invoke-WebRequest -Uri "$targetUrl/api/health" -UseBasicParsing -TimeoutSec 5
    if ($health.StatusCode -ne 200) {
        throw "Backend no responde correctamente."
    }
    Write-Host 'Backend OK en http://localhost:3000'
}
catch {
    Write-Host 'El backend no está disponible en 3000. Arráncalo con: npm run backend'
    exit 1
}

$mode = if ($args.Count -gt 0 -and $args[0] -eq 'full') { 'full' } else { 'baseline' }
$reportFile = if ($mode -eq 'full') { 'zap-full.json' } else { 'zap-baseline.json' }

Write-Host "Ejecutando ZAP en modo $mode..."

docker run --rm `
  -v "${projectPath}:/zap/wrk:rw" `
  ghcr.io/zaproxy/zaproxy:stable `
  zap.sh -cmd `
  -quickurl $targetUrl `
  -quickout "/zap/wrk/reports/$reportFile" `
  -quickprogress `
  -config "globalexcludeurl.url_list=^https?://localhost:5173$" `
  $(if ($mode -eq 'full') { '-cha' })

Write-Host "Reporte generado en $reportDir"
