#!/usr/bin/env pwsh
# Script de verificación para testing local antes de deploy

Write-Host "🔍 VERIFICACIÓN DEL PROYECTO ATU TRAFFIC PULSE" -ForegroundColor Cyan
Write-Host "=" -repeat 60 -ForegroundColor Cyan
Write-Host ""

# Variables
$BACKEND_URL = "http://localhost:5000"
$FRONTEND_URL = "http://localhost:5173"

# Función para verificar un endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description
    )
    
    try {
        Write-Host "Probando: $Description" -NoNewline
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅" -ForegroundColor Green
            return $true
        } else {
            Write-Host " ❌ (Status: $($response.StatusCode))" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host " ❌ (Error: $($_.Exception.Message))" -ForegroundColor Red
        return $false
    }
}

# 1. Verificar que Python está instalado
Write-Host "1️⃣ Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Python no encontrado" -ForegroundColor Red
    Write-Host "   Instala Python 3.11+ desde https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar que Node está instalado
Write-Host "`n2️⃣ Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js no encontrado" -ForegroundColor Red
    Write-Host "   Instala Node.js 18+ desde https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 3. Verificar que el archivo Excel existe
Write-Host "`n3️⃣ Verificando archivo de datos Excel..." -ForegroundColor Yellow
$excelPath = "src\Mapas\data_transito.xlsx"
if (Test-Path $excelPath) {
    $fileSize = (Get-Item $excelPath).Length / 1KB
    Write-Host "   ✅ $excelPath encontrado ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "   ❌ $excelPath NO encontrado" -ForegroundColor Red
    Write-Host "   El backend no podrá funcionar sin este archivo" -ForegroundColor Yellow
}

# 4. Verificar dependencias de Python
Write-Host "`n4️⃣ Verificando dependencias de Python..." -ForegroundColor Yellow
if (Test-Path "requirements.txt") {
    Write-Host "   ✅ requirements.txt encontrado" -ForegroundColor Green
    
    # Verificar si está en un venv
    if ($env:VIRTUAL_ENV) {
        Write-Host "   ✅ Virtual environment activo: $env:VIRTUAL_ENV" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  No hay virtual environment activo" -ForegroundColor Yellow
        Write-Host "   Considera crear uno: python -m venv venv" -ForegroundColor Gray
        Write-Host "   Y activarlo: .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ requirements.txt NO encontrado" -ForegroundColor Red
}

# 5. Verificar dependencias de Node
Write-Host "`n5️⃣ Verificando dependencias de Node..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  node_modules NO encontrado" -ForegroundColor Yellow
    Write-Host "   Ejecuta: npm install" -ForegroundColor Gray
}

if (Test-Path "package.json") {
    Write-Host "   ✅ package.json encontrado" -ForegroundColor Green
} else {
    Write-Host "   ❌ package.json NO encontrado" -ForegroundColor Red
}

# 6. Intentar verificar si los servicios están corriendo
Write-Host "`n6️⃣ Verificando servicios..." -ForegroundColor Yellow

# Backend
Write-Host "`n   Backend (Python Flask):" -ForegroundColor Cyan
$backendHealth = Test-Endpoint "$BACKEND_URL/health" "   - Health endpoint"
$backendDebug = Test-Endpoint "$BACKEND_URL/api/debug" "   - Debug endpoint"
$backendKpis = Test-Endpoint "$BACKEND_URL/api/kpis" "   - KPIs endpoint"

if (-not ($backendHealth -or $backendDebug)) {
    Write-Host "`n   ⚠️  Backend no está corriendo" -ForegroundColor Yellow
    Write-Host "   Para iniciar el backend:" -ForegroundColor Gray
    Write-Host "   1. cd src\Mapas" -ForegroundColor Gray
    Write-Host "   2. python app.py" -ForegroundColor Gray
    Write-Host "   O ejecuta: .\start_backend.sh" -ForegroundColor Gray
}

# Frontend
Write-Host "`n   Frontend (React + Vite):" -ForegroundColor Cyan
$frontendRunning = Test-Endpoint "$FRONTEND_URL" "   - Desarrollo"

if (-not $frontendRunning) {
    Write-Host "`n   ⚠️  Frontend no está corriendo" -ForegroundColor Yellow
    Write-Host "   Para iniciar el frontend:" -ForegroundColor Gray
    Write-Host "   npm run dev" -ForegroundColor Gray
}

# 7. Resumen
Write-Host "`n" + ("=" -join (1..60)) -ForegroundColor Cyan
Write-Host "📊 RESUMEN" -ForegroundColor Cyan
Write-Host ("=" -join (1..60)) -ForegroundColor Cyan

if ($backendHealth -and $frontendRunning) {
    Write-Host "✅ TODO LISTO - La aplicación está funcionando correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Accede a la aplicación:" -ForegroundColor Cyan
    Write-Host "   Frontend: $FRONTEND_URL" -ForegroundColor White
    Write-Host "   Backend:  $BACKEND_URL" -ForegroundColor White
} elseif ($backendHealth) {
    Write-Host "⚠️  Backend OK, pero frontend no está corriendo" -ForegroundColor Yellow
    Write-Host "   Ejecuta: npm run dev" -ForegroundColor Gray
} elseif ($frontendRunning) {
    Write-Host "⚠️  Frontend OK, pero backend no está corriendo" -ForegroundColor Yellow
    Write-Host "   Ejecuta en otra terminal:" -ForegroundColor Gray
    Write-Host "   cd src\Mapas && python app.py" -ForegroundColor Gray
} else {
    Write-Host "❌ Ningún servicio está corriendo" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para iniciar la aplicación completa:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Terminal 1 (Backend):" -ForegroundColor Cyan
    Write-Host "   cd src\Mapas" -ForegroundColor White
    Write-Host "   python app.py" -ForegroundColor White
    Write-Host ""
    Write-Host "Terminal 2 (Frontend):" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor White
}

Write-Host ""
Write-Host "📝 Para más información, consulta:" -ForegroundColor Gray
Write-Host "   - RENDER_DEPLOY_GUIDE.md" -ForegroundColor Gray
Write-Host "   - CAMBIOS_REALIZADOS.md" -ForegroundColor Gray
Write-Host ""
