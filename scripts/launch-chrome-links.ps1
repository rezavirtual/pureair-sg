$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$siteUrl = "file:///C:/AI/Amazon/dist/index.html"

Write-Host "Opening PetTech Singapore site in Google Chrome..."
Start-Process $chrome -ArgumentList $siteUrl

$seedJson = Get-Content -Path "C:\AI\Amazon\data\products-seed.json" -Raw | ConvertFrom-Json

Write-Host "Opening all $($seedJson.Count) verified Amazon.sg single product pages in Chrome tabs..."
foreach ($p in $seedJson) {
    $url = "https://www.amazon.sg/dp/$($p.asin)/?tag=pettechsg-22&linkCode=ogi&th=1&psc=1"
    Write-Host " -> Opening [$($p.asin)] $($p.title)"
    Start-Process $chrome -ArgumentList $url
    Start-Sleep -Milliseconds 600
}

Write-Host "All verified links have been launched in Google Chrome on your PC!"
