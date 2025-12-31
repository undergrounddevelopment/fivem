$ErrorActionPreference = 'SilentlyContinue'

# Paths to ignore (regex patterns)
$ignorePatterns = @('\\.git\\', 'node_modules', '\\.next\\', 'dist', 'build', 'out')

# Collect file info and compute hashes
$files = Get-ChildItem -Path . -Recurse -File -Force |
    Where-Object {
        $full = $_.FullName
        foreach ($pattern in $ignorePatterns) {
            if ($full -match $pattern) { return $false }
        }
        return $true
    } |
    Get-FileHash -Algorithm SHA256

# Group by hash and filter duplicates
$duplicates = $files |
    Group-Object -Property Hash |
    Where-Object { $_.Count -gt 1 }

$resultObjects = @()
foreach ($dupGroup in $duplicates) {
    foreach ($item in $dupGroup.Group) {
        $resultObjects += [PSCustomObject]@{
            Hash = $item.Hash
            Path = $item.Path
            Size = (Get-Item $item.Path).Length
        }
    }
}

if ($resultObjects.Count -eq 0) {
    Write-Host "No duplicate files found."
} else {
    $jsonPath = Join-Path -Path (Get-Location) -ChildPath 'duplicates_report.json'
    $resultObjects | ConvertTo-Json -Depth 3 | Out-File -Encoding UTF8 $jsonPath
    Write-Host "Duplicate scan complete. Report saved to $jsonPath"
}
