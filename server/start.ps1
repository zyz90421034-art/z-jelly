$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$env:HF_HOME = Join-Path (Get-Location) '.model-cache/huggingface'
$env:U2NET_HOME = Join-Path (Get-Location) '.model-cache/rembg'
$env:HF_HUB_DISABLE_SYMLINKS_WARNING = '1'
& './.venv-model/Scripts/python.exe' -m uvicorn server.app:app --host 127.0.0.1 --port 7861 --no-access-log
