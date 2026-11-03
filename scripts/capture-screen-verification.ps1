Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$siteUrl = "file:///C:/AI/Amazon/dist/index.html"

Write-Host "Bringing Chrome to front with PetTech SG..."
Start-Process $chromePath -ArgumentList $siteUrl
Start-Sleep -Seconds 2

# Capture screen
$bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)

$outputPath = "C:\AI\Amazon\screen_verification.png"
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()

Write-Host "Screen verification screenshot captured: $outputPath ($((Get-Item $outputPath).Length) bytes)"
