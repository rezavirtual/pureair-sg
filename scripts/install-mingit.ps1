$ErrorActionPreference = 'Stop'
$url = 'https://github.com/git-for-windows/git/releases/download/v2.56.0.windows.4/MinGit-2.56.0.4-64-bit.zip'
$targetDir = Join-Path $env:LOCALAPPDATA 'Programs\MinGit'

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

$zipPath = Join-Path $targetDir 'mingit.zip'
Write-Host "Downloading MinGit (25MB)..."
Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing
Write-Host "Extracting MinGit..."
Expand-Archive -Path $zipPath -DestinationPath $targetDir -Force
Remove-Item -Path $zipPath -Force

$gitExe = Join-Path $targetDir 'cmd\git.exe'
Write-Host "MinGit successfully installed at: $gitExe"

# Add to user PATH permanently
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$cmdDir = Join-Path $targetDir 'cmd'
if ($userPath -notlike "*$cmdDir*") {
    [Environment]::SetEnvironmentVariable('Path', "$userPath;$cmdDir", 'User')
    Write-Host "Added $cmdDir to User PATH."
}
