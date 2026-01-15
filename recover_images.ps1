$urls = Get-Content -Path "unique_old_urls.txt"
$baseDir = "D:\DATAP PRIBADI WEBSITE\WEB UPDATED TERBARU FIVEMTOOLS.NET\recovered_assets"

foreach ($url in $urls) {
    if ($url -like "*thumbnails*") {
        $category = "thumbnails"
    } elseif ($url -like "*images*") {
        $category = "images"
    } else {
        $category = "."
    }
    
    $filename = [System.IO.Path]::GetFileName($url)
    $targetPath = Join-Path $baseDir -ChildPath "$category\$filename"
    
    Write-Host "Downloading $filename to $category..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $targetPath -ErrorAction Stop
    } catch {
        Write-Error "Failed to download $url"
    }
}
