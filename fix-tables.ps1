Write-Host "🔧 Fixing all table names..." -ForegroundColor Cyan

$replacements = @(
    @{ Pattern = 'from\("public_notifications"\)'; Replacement = 'from("notifications")' },
    @{ Pattern = "from\('public_notifications'\)"; Replacement = "from('notifications')" },
    @{ Pattern = 'from\("asset_reviews"\)'; Replacement = 'from("testimonials")' },
    @{ Pattern = "from\('asset_reviews'\)"; Replacement = "from('testimonials')" },
    @{ Pattern = 'from\("daily_claims"\)'; Replacement = 'from("spin_wheel_tickets")' },
    @{ Pattern = "from\('daily_claims'\)"; Replacement = "from('spin_wheel_tickets')" }
)

$files = Get-ChildItem -Path "app\api" -Filter "*.ts" -Recurse | Where-Object { $_.FullName -notmatch 'node_modules' }

$totalFixed = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileChanged = $false
    
    foreach ($rep in $replacements) {
        if ($content -match $rep.Pattern) {
            $content = $content -replace $rep.Pattern, $rep.Replacement
            $fileChanged = $true
        }
    }
    
    if ($fileChanged) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✅ Fixed: $($file.FullName)" -ForegroundColor Green
        $totalFixed++
    }
}

Write-Host "`n✅ Fixed $totalFixed files!" -ForegroundColor Green
