# Deploy script for S01Back NestJS backend with independent port deployment
Write-Host "[Deploy] Starting S01Back NestJS backend deployment process..." -ForegroundColor Green

# Load environment variables from .env file
$envFile = Join-Path $PSScriptRoot ".env-s01back"
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
$serverPath = if ($env:SERVER_S01BACK_PATH) { $env:SERVER_S01BACK_PATH } else { "/root/project/1LoanManagement/S01Back" }
$serverConfigPath = if ($env:SERVER_CONFIG_PATH) { $env:SERVER_CONFIG_PATH } else { "/root/project/CD/1LoanManagement/S01Back" }
$projectPath = if ($env:LOCAL_S01BACK_PATH) { $env:LOCAL_S01BACK_PATH } else { "C:\Users\what\Desktop\my-project\1LoanManagement\S01Back" }

if (-not $serverPassword) {
    Write-Host "[Error] SERVER_PASSWORD not found in environment variables" -ForegroundColor Red
    exit 1
}

Write-Host "[Config] Server: $serverHost" -ForegroundColor Yellow
Write-Host "[Config] Target: S01Back NestJS Backend (Port 13001)" -ForegroundColor Yellow
Write-Host "[Config] Project Path: $projectPath" -ForegroundColor Yellow

# Check and navigate to S01Back
if (!(Test-Path $projectPath)) {
    Write-Host "[Error] S01Back directory not found at: $projectPath" -ForegroundColor Red
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
    Write-Host "[Step2] Building S01Back project..." -ForegroundColor Cyan
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
            $plinkCommand = "echo y | plink -pw '$serverPassword' ${serverUser}@${serverHost} 'mkdir -p ${serverPath} && mkdir -p ${serverConfigPath} && mkdir -p ${serverPath}/logs'"
            Write-Host "[Execute] Creating directories on server..." -ForegroundColor Gray
            Invoke-Expression $plinkCommand
        } catch {
            Write-Host "[Warning] Directory creation failed: $_" -ForegroundColor Yellow
        }
    }

    # 4. Upload source code to server
    Write-Host "[Step4] Uploading S01Back source code to server..." -ForegroundColor Cyan
    $pscpExists = Get-Command pscp -ErrorAction SilentlyContinue
    if ($pscpExists) {
        try {
            # Upload all necessary files except node_modules
            $pscpCommand = "echo y | pscp -pw '$serverPassword' -r package*.json src dist tsconfig*.json nest-cli.json ${serverUser}@${serverHost}:${serverPath}/"
            Write-Host "[Execute] Uploading source files..." -ForegroundColor Gray
            Invoke-Expression $pscpCommand
        } catch {
            throw "File transfer failed: $_"
        }
    }

    # 5. Upload config files
    Write-Host "[Step5] Uploading S01Back config files..." -ForegroundColor Cyan
    $configPath = $PSScriptRoot
    if (Test-Path $configPath) {
        if ($pscpExists) {
            $pscpConfigCommand = "pscp -pw '$serverPassword' ${configPath}/docker-compose.yml ${configPath}/Dockerfile ${configPath}/.env-s01back ${serverUser}@${serverHost}:${serverConfigPath}/"
            Write-Host "[Execute] Uploading config files..." -ForegroundColor Gray
            Invoke-Expression $pscpConfigCommand
        }
    }

    # 6. Stop existing containers
    Write-Host "[Step6] Stopping existing S01Back containers..." -ForegroundColor Cyan
    try {
        if ($plinkExists) {
            $plinkCommand = "plink -batch -pw '$serverPassword' ${serverUser}@${serverHost} 'cd ${serverConfigPath} && docker compose down || true'"
            Write-Host "[Execute] Stopping existing containers..." -ForegroundColor Gray
            Invoke-Expression $plinkCommand
        }
    } catch {
        Write-Host "[Info] No existing containers to stop" -ForegroundColor Yellow
    }

    # 7. Copy source files to server config directory for Docker build
    Write-Host "[Step7] Setting up S01Back project on server..." -ForegroundColor Cyan
    try {
        if ($plinkExists) {
            # Copy all files from serverPath to serverConfigPath for Docker build context
            $plinkCommand = "plink -batch -pw '$serverPassword' ${serverUser}@${serverHost} 'cp -r ${serverPath}/* ${serverConfigPath}/'"
            Write-Host "[Execute] Setting up project..." -ForegroundColor Gray
            Invoke-Expression $plinkCommand
        }
    } catch {
        Write-Host "[Warning] Project setup failed: $_" -ForegroundColor Yellow
    }

    # 8. Start S01Back containers
    Write-Host "[Step8] Starting S01Back containers..." -ForegroundColor Cyan
    try {
        if ($plinkExists) {
            $plinkCommand = "plink -batch -pw '$serverPassword' ${serverUser}@${serverHost} 'cd ${serverConfigPath} && docker compose up -d --build'"
            Write-Host "[Execute] Starting containers..." -ForegroundColor Gray
            Invoke-Expression $plinkCommand
        }
    } catch {
        Write-Host "[Error] Container start failed: $_" -ForegroundColor Red
        throw
    }

    # 9. Verify deployment
    Write-Host "[Step9] Verifying S01Back deployment..." -ForegroundColor Cyan
    try {
        if ($plinkExists) {
            $plinkVerifyCommand = "plink -batch -pw '$serverPassword' ${serverUser}@${serverHost} 'docker ps | grep s01back'"
            Write-Host "[Execute] Verifying containers..." -ForegroundColor Gray
            Invoke-Expression $plinkVerifyCommand
        }
    } catch {
        Write-Host "[Warning] Verification failed: $_" -ForegroundColor Yellow
    }

    Write-Host "[Done] S01Back NestJS backend deployment successful!" -ForegroundColor Green
    Write-Host "[Access] Backend API: http://$serverHost:13001" -ForegroundColor Yellow
    Write-Host "[Access] MySQL: $serverHost:13306" -ForegroundColor Yellow
    Write-Host "[Access] Redis: $serverHost:13379" -ForegroundColor Yellow

} catch {
    Write-Host "[Error] Deployment failed: $_" -ForegroundColor Red
    exit 1
} finally {
    Set-Location $currentPath
}
