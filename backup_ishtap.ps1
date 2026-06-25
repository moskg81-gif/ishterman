# Backup ishtap_app.tsx with date stamp
$src  = "$PSScriptRoot\ishtap_app.tsx"
$dir  = "$PSScriptRoot\backups"
$date = Get-Date -Format "yyyy-MM-dd"
$dst  = "$dir\ishtap_app_$date.tsx"

if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

Copy-Item -Path $src -Destination $dst -Force
Write-Host "Backed up to $dst"

# Keep only last 30 days
Get-ChildItem "$dir\ishtap_app_*.tsx" |
  Sort-Object Name -Descending |
  Select-Object -Skip 30 |
  Remove-Item -Force
