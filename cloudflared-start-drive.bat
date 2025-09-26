@echo off
REM Cloudflared auto-start for QR-Tunai Drive
REM Place a shortcut to this file in shell:startup to run on Windows logon

pushd "%~dp0"

set "CLOUDFLARED_EXE=C:\Program Files\Cloudflare\cloudflared.exe"
if not exist "%CLOUDFLARED_EXE%" (
  set "CLOUDFLARED_EXE=C:\cloudflared\cloudflared.exe"
)

set "CONFIG_FILE=%~dp0\.cloudflared\config.yml"
if not exist "%CONFIG_FILE%" (
  echo Config file not found: %CONFIG_FILE%
  popd
  exit /b 1
)

start "cloudflared" /min "%CLOUDFLARED_EXE%" tunnel --config "%CONFIG_FILE%" run

popd
exit /b 0
