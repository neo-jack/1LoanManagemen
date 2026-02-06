# Deploy script for H02Front microfront-end with independent port deployment
Write-Host "[Deploy] Starting H02Front microfront-end deployment process..." -ForegroundColor Green

# Load environment variables from .env file
$envFile = Join-Path $PSScriptRoot ".env-h02front"
if (Test-Path $envFile) {
    Write-Host "[Config] Loading environment variables from .env file..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
} else {
    Write-Host "[Warning] .env file not found, using default values" -ForegroundColor Yellow
}

# Server configuration from environment variables
$serverHost = if ($env:SERVER_HOST) { $env:SERVER_HOST } else { "113.45.4.229" }
$serverUser = if ($env:SERVER_USER) { $env:SERVER_USER } else { "root" }
$serverPassword = $env:SERVER_PASSWORD
$serverPath = if ($env:SERVER_H02FRONT_PATH) { $env:SERVER_H02FRONT_PATH } else { "/root/project/1LoanManagement/H02Front/dist" }
$serverConfigPath = if ($env:SERVER_CONFIG_PATH) { $env:SERVER_CONFIG_PATH } else { "/root/project/CD/1LoanManagement/H02Front" }
$projectPath = if ($env:LOCAL_H02FRONT_PATH) { $env:LOCAL_H02FRONT_PATH } else { "C:\Users\what\Desktop\my-project\1LoanManagement\H02Front" }

if (-not $serverPassword) {
    Write-Host "[Error] SERVER_PASSWORD not found in environment variables" -ForegroundColor Red
    exit 1
}

Write-Host "[Config] Server: $serverHost" -ForegroundColor Yellow
Write-Host "[Config] Target: H02Front Microfront-end (Port 3002)" -ForegroundColor Yellow
Write-Host "[Config] Project Path: $projectPath" -ForegroundColor Yellow

# Check and navigate to H02Front
if (!(Test-Path $projectPath)) {
    Write-Host "[Error] H02Front directory not found at: $projectPath" -ForegroundColor Red
    exit 1
}

$currentPath = Get-Location
Set-Location $projectPath
Write-Host "[Info] Changed to project directory: $projectPath" -ForegroundColor Yellow

try {
    # 1. Install dependencies if needed
    if (!(Test-Path "node_modules")) {
        Write-Host "[Step1] Installing dependencies..." -ForegroundColor Cyan
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "Dependencies installation failed with exit code $LASTEXITCODE"
        }
    }

    # 2. Build project
    Write-Host "[Step2] Building H02Front project..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build command failed with exit code $LASTEXITCODE"
    }

    if (!(Test-Path "dist")) {
        Write-Host "[Error] Build failed, dist directory not found" -ForegroundColor Red
        exit 1
    }

    # 3. Create server directory if not exists
    Write-Host "[Step3] Preparing server directory..." -ForegroundColor Cyan
    $plinkExists = Get-Command plink -ErrorAction SilentlyContinue
    if ($plinkExists) {
        try {
            $plinkCommand = "echo y | plink -pw '$serverPassword' ${serverUser}@${serverHost} 'mkdir -p ${serverPath} && mkdir -p ${serverConfigPath}'"
            Write-Host "[Execute] Creating directories on server..." -ForegroundColor Gray
            Invoke-Expression $plinkCommand
        } catch {
            Write-Host "[Warning] Directory creation failed: $_" -ForegroundColor Yellow
        }
    }

    # 4. Upload dist to server
    Write-Host "[Step4] Uploading H02Front dist to server..." -ForegroundColor Cyan
    $pscpExists = Get-Command pscp -ErrorAction SilentlyContinue
    if ($pscpExists) {
        try {
            $pscpCommand = "echo y | pscp -pw '$serverPassword' -r dist/* ${serverUser}@${serverHost}:${serverPath}/"
            Write-Host "[Execute] Uploading files..." -ForegroundColor Gray
            Invoke-Expression $pscpCommand
        } catch {
            throw "File transfer failed: $_"
        }
    }

    # 5. Upload config files
    Write-Host "[Step5] Uploading H02Front config files..." -ForegroundColor Cyan
    $configPath = $PSScriptRoot
    if (Test-Path $configPath) {
        if ($pscpExists) {
            $pscpConfigCommand = "pscp -pw '$serverPassword' ${configPath}/docker-compose.yml ${configPath}/nginx.conf ${serverUser}@${serverHost}:${serverConfigPath}/"
            Write-Host "[Execute] Uploading config files..." -ForegroundColor Gray
            Invoke-Expression $pscpConfigCommand
        }
    }

    # 6. Stop existing container
    Write-Host "[Step6] Stopping existing H02Front container..." -ForegroundColor Cyan
    try {
        if ($plinkExists) {
            $plinkCommand = "plink -batch -pw '$serverPassword' ${serverUser}@${serverHost} 'cd ${serverConfigPath} && docker stop h02front-nginx || true && docker rm h02front-nginx || true'"
            Write-Host "[Execute] Stopping existing container..." -ForegroundColor Gray
            Invoke-Expression $plinkCommand
        }
    } catch {
        Write-Host "[Info] No existing container to stop" -ForegroundColor Yellow
    }

    # 7. Start H02Front container
    Write-Host "[Step7] Starting H02Front container..." -ForegroundColor Cyan
    try {
        if ($plinkExists) {
            $plinkCommand = "plink -batch -pw '$serverPassword' ${serverUser}@${serverHost} 'cd ${serverConfigPath} && docker compose up -d'"
            Write-Host "[Execute] Starting container..." -ForegroundColor Gray
            Invoke-Expression $plinkCommand
        }
    } catch {
        Write-Host "[Error] Container start failed: $_" -ForegroundColor Red
        throw
    }

    # 8. Verify deployment
    Write-Host "[Step8] Verifying H02Front deployment..." -ForegroundColor Cyan
    try {
        if ($plinkExists) {
            $plinkVerifyCommand = "plink -batch -pw '$serverPassword' ${serverUser}@${serverHost} 'docker ps | grep h02front-nginx'"
            Write-Host "[Execute] Verifying container..." -ForegroundColor Gray
            Invoke-Expression $plinkVerifyCommand
        }
    } catch {
        Write-Host "[Warning] Verification failed: $_" -ForegroundColor Yellow
    }

    Write-Host "[Done] H02Front microfront-end deployment successful!" -ForegroundColor Green
    Write-Host "[Access] http://$serverHost:3002" -ForegroundColor Yellow

} catch {
    Write-Host "[Error] Deployment failed: $_" -ForegroundColor Red
    exit 1
} finally {
    Set-Location $currentPath
}
