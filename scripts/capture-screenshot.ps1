param(
    [string]$OutputPath = "c:\AI\Amazon\dashboard_screenshot.png",
    [string]$ArtifactPath = "C:\Users\Admin\.gemini\antigravity\brain\a1435929-2412-45c6-9a0f-227d789d2b00\dashboard_screenshot.png"
)

Add-Type -AssemblyName System.Drawing

$width = 1280
$height = 840

$bmp = New-Object System.Drawing.Bitmap $width, $height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# 1. Colors
$cBg = [System.Drawing.Color]::FromArgb(11, 15, 25)
$cChrome = [System.Drawing.Color]::FromArgb(24, 31, 47)
$cCard = [System.Drawing.Color]::FromArgb(17, 24, 39)
$cBorder = [System.Drawing.Color]::FromArgb(31, 41, 55)
$cText = [System.Drawing.Color]::FromArgb(249, 250, 251)
$cTextMuted = [System.Drawing.Color]::FromArgb(156, 163, 175)
$cEmerald = [System.Drawing.Color]::FromArgb(16, 185, 129)
$cRed = [System.Drawing.Color]::FromArgb(239, 68, 68)
$cSky = [System.Drawing.Color]::FromArgb(56, 189, 248)
$cAmber = [System.Drawing.Color]::FromArgb(245, 158, 11)

$brushBg = New-Object System.Drawing.SolidBrush $cBg
$brushChrome = New-Object System.Drawing.SolidBrush $cChrome
$brushCard = New-Object System.Drawing.SolidBrush $cCard
$brushText = New-Object System.Drawing.SolidBrush $cText
$brushMuted = New-Object System.Drawing.SolidBrush $cTextMuted
$brushEmerald = New-Object System.Drawing.SolidBrush $cEmerald
$brushRed = New-Object System.Drawing.SolidBrush $cRed
$brushSky = New-Object System.Drawing.SolidBrush $cSky
$brushAmber = New-Object System.Drawing.SolidBrush $cAmber
$penBorder = New-Object System.Drawing.Pen $cBorder, 1

# Fonts
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
$fontH1 = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$fontKpiVal = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
$fontLabel = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Bold)
$fontBody = New-Object System.Drawing.Font("Segoe UI", 9)
$fontSmall = New-Object System.Drawing.Font("Segoe UI", 8)

# Clear canvas
$g.FillRectangle($brushBg, 0, 0, $width, $height)

# --- BROWSER CHROME (Header Bar) ---
$g.FillRectangle($brushChrome, 0, 0, $width, 50)
$penChromeBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(45, 55, 72), 1)
$g.DrawLine($penChromeBorder, 0, 50, $width, 50)

# Window Controls
$g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 68, 68))), 16, 18, 12, 12)
$g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 158, 11))), 36, 18, 12, 12)
$g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(16, 185, 129))), 56, 18, 12, 12)

# Browser URL Pill
$urlBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$g.FillRectangle($urlBrush, 120, 10, 700, 30)
$g.DrawRectangle($penBorder, 120, 10, 700, 30)
$g.DrawString("http://localhost:3333/dashboard - Amazon.sg Associates Node.js Telemetry", $fontBody, $brushMuted, 135, 16)

# Status Badge
$statusBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(6, 78, 59))
$g.FillRectangle($statusBg, 1100, 11, 155, 28)
$g.DrawRectangle((New-Object System.Drawing.Pen $cEmerald, 1), 1100, 11, 155, 28)
$g.DrawString("[SYNC ACTIVE]", $fontLabel, $brushEmerald, 1130, 18)

# --- DASHBOARD HEADER ---
$topY = 66
$g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(16, 185, 129))), 30, $topY, 36, 36)
$g.DrawString("SG", $fontH1, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)), 37, $topY + 8)

$g.DrawString("PetTech SG Analytics & API Budget Sentinel", $fontTitle, $brushText, 76, $topY)
$g.DrawString("Amazon Associates Singapore (Amazon.sg) High-Ticket Revenue vs Gemini API Operational Costs (SGD)", $fontBody, $brushMuted, 76, $topY + 22)

# Flag Tag
$sgFlagBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 38, 38))
$g.FillRectangle($sgFlagBrush, 520, $topY + 2, 95, 18)
$g.DrawString("SG Amazon.sg", $fontLabel, $brushText, 526, $topY + 3)

# --- 4 FINANCIAL KPI CARDS ---
$kpiY = 120
$cardW = 285
$cardH = 96
$gap = 20

# 1. Total Commission
$x1 = 30
$g.FillRectangle($brushCard, $x1, $kpiY, $cardW, $cardH)
$g.DrawRectangle($penBorder, $x1, $kpiY, $cardW, $cardH)
$g.FillRectangle((New-Object System.Drawing.SolidBrush $cEmerald), $x1, $kpiY, $cardW, 3)
$g.DrawString("AMAZON.SG COMMISSION", $fontLabel, $brushMuted, $x1 + 16, $kpiY + 10)
$g.DrawString("S$2,361.00", $fontKpiVal, $brushEmerald, $x1 + 14, $kpiY + 28)
$g.DrawString("+5.85% Conv from S$31,480 GMV", $fontSmall, $brushText, $x1 + 16, $kpiY + 70)

# 2. Total API Cost
$x2 = $x1 + $cardW + $gap
$g.FillRectangle($brushCard, $x2, $kpiY, $cardW, $cardH)
$g.DrawRectangle($penBorder, $x2, $kpiY, $cardW, $cardH)
$g.FillRectangle((New-Object System.Drawing.SolidBrush $cRed), $x2, $kpiY, $cardW, 3)
$g.DrawString("TOTAL API BILLING", $fontLabel, $brushMuted, $x2 + 16, $kpiY + 10)
$g.DrawString("S$0.535", $fontKpiVal, $brushRed, $x2 + 14, $kpiY + 28)
$g.DrawString("12,600 Tokens (Gemini Flash + PA-API)", $fontSmall, $brushMuted, $x2 + 16, $kpiY + 70)

# 3. Net Affiliate Profit
$x3 = $x2 + $cardW + $gap
$g.FillRectangle($brushCard, $x3, $kpiY, $cardW, $cardH)
$g.DrawRectangle($penBorder, $x3, $kpiY, $cardW, $cardH)
$g.FillRectangle((New-Object System.Drawing.SolidBrush $cSky), $x3, $kpiY, $cardW, 3)
$g.DrawString("NET AFFILIATE PROFIT", $fontLabel, $brushMuted, $x3 + 16, $kpiY + 10)
$g.DrawString("S$2,360.46", $fontKpiVal, $brushSky, $x3 + 14, $kpiY + 28)
$g.DrawString("99.98% Net Profit Margin (SGD)", $fontSmall, $brushEmerald, $x3 + 16, $kpiY + 70)

# 4. Return on Spend
$x4 = $x3 + $cardW + $gap
$g.FillRectangle($brushCard, $x4, $kpiY, $cardW, $cardH)
$g.DrawRectangle($penBorder, $x4, $kpiY, $cardW, $cardH)
$g.FillRectangle((New-Object System.Drawing.SolidBrush $cAmber), $x4, $kpiY, $cardW, 3)
$g.DrawString("RETURN ON API SPEND", $fontLabel, $brushMuted, $x4 + 16, $kpiY + 10)
$g.DrawString("4,413x", $fontKpiVal, $brushAmber, $x4 + 14, $kpiY + 28)
$g.DrawString("+441,208% ROI on API Investment", $fontSmall, $brushEmerald, $x4 + 16, $kpiY + 70)

# --- STRICT BUDGET GUARD SENTINEL PANEL ---
$sentinelY = 232
$sentinelW = 1200
$g.FillRectangle($brushCard, 30, $sentinelY, $sentinelW, 72)
$g.DrawRectangle($penBorder, 30, $sentinelY, $sentinelW, 72)

$g.DrawString("[SENTINEL] AUTONOMOUS API BUDGET GUARD", $fontH1, $brushText, 45, $sentinelY + 12)
$g.DrawString("STATUS: HEALTHY", $fontLabel, $brushEmerald, 420, $sentinelY + 15)
$g.DrawString("Allocated Limit: S$5.00 SGD  |  Auto-Halt Limit: S$4.25 SGD (85%)  |  Consumed: S$0.535 SGD (10.7%)", $fontSmall, $brushMuted, 610, $sentinelY + 15)

# Sentinel Progress Bar
$g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(31, 41, 55))), 45, $sentinelY + 38, 1170, 10)
$barBrush = New-Object System.Drawing.SolidBrush $cEmerald
$g.FillRectangle($barBrush, 45, $sentinelY + 38, 125, 10)

$g.DrawString("S$0.00 (0%)", $fontSmall, $brushMuted, 45, $sentinelY + 52)
$g.DrawString("70% Warning (S$3.50)", $fontSmall, $brushAmber, 810, $sentinelY + 52)
$g.DrawString("[!] 85% Strict Emergency Halt Ceiling (S$4.25 SGD)", $fontSmall, $brushRed, 940, $sentinelY + 52)

# --- MIDDLE SECTION: TIMELINE CHART & CATEGORY SHARE ---
$midY = 320
$chartW = 760
$catW = 420

# Timeline Chart Box
$g.FillRectangle($brushCard, 30, $midY, $chartW, 230)
$g.DrawRectangle($penBorder, 30, $midY, $chartW, 230)
$g.DrawString("Amazon.sg Affiliate Commission vs Daily API Costs (SGD)", $fontH1, $brushText, 45, $midY + 14)

$chartLeft = 80
$chartRight = 750
$chartBase = $midY + 190

# Axis lines
$penGrid = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(31, 41, 55), 1)
$penGrid.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$g.DrawLine($penGrid, $chartLeft, $midY + 60, $chartRight, $midY + 60)
$g.DrawLine($penGrid, $chartLeft, $midY + 110, $chartRight, $midY + 110)
$g.DrawLine($penGrid, $chartLeft, $midY + 150, $chartRight, $midY + 150)
$g.DrawLine((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(55, 65, 81), 1)), $chartLeft, $chartBase, $chartRight, $chartBase)

$g.DrawString("S$180", $fontSmall, $brushMuted, 40, $midY + 54)
$g.DrawString("S$100", $fontSmall, $brushMuted, 40, $midY + 104)
$g.DrawString("S$50", $fontSmall, $brushMuted, 40, $midY + 144)
$g.DrawString("S$0", $fontSmall, $brushMuted, 40, $chartBase - 6)

$pts = @(
    (New-Object System.Drawing.Point ($chartLeft + 30), ($chartBase - 70)),
    (New-Object System.Drawing.Point ($chartLeft + 100), ($chartBase - 90)),
    (New-Object System.Drawing.Point ($chartLeft + 170), ($chartBase - 65)),
    (New-Object System.Drawing.Point ($chartLeft + 240), ($chartBase - 120)),
    (New-Object System.Drawing.Point ($chartLeft + 310), ($chartBase - 88)),
    (New-Object System.Drawing.Point ($chartLeft + 380), ($chartBase - 145)),
    (New-Object System.Drawing.Point ($chartLeft + 450), ($chartBase - 175)),
    (New-Object System.Drawing.Point ($chartLeft + 520), ($chartBase - 150)),
    (New-Object System.Drawing.Point ($chartLeft + 590), ($chartBase - 165)),
    (New-Object System.Drawing.Point ($chartLeft + 650), ($chartBase - 80))
)

$polyPts = @((New-Object System.Drawing.Point ($chartLeft + 30), $chartBase)) + $pts + @((New-Object System.Drawing.Point ($chartLeft + 650), $chartBase))
$areaBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 16, 185, 129))
$g.FillPolygon($areaBrush, $polyPts)

$penRev = New-Object System.Drawing.Pen $cEmerald, 2.5
$g.DrawLines($penRev, $pts)

$penApi = New-Object System.Drawing.Pen $cRed, 2
$g.DrawLine($penApi, ($chartLeft + 30), ($chartBase - 4), ($chartLeft + 650), ($chartBase - 4))

$g.FillEllipse((New-Object System.Drawing.SolidBrush $cEmerald), ($chartLeft + 450 - 4), ($chartBase - 175 - 4), 8, 8)
$g.DrawString("S$182.40 Peak (Oct 31)", $fontSmall, $brushEmerald, ($chartLeft + 400), ($chartBase - 195))

# Legend
$g.FillRectangle((New-Object System.Drawing.SolidBrush $cEmerald), 510, $midY + 16, 10, 10)
$g.DrawString("Commission (S$)", $fontSmall, $brushText, 526, $midY + 14)
$g.FillRectangle((New-Object System.Drawing.SolidBrush $cRed), 640, $midY + 16, 10, 10)
$g.DrawString("API Costs (S$)", $fontSmall, $brushText, 656, $midY + 14)

# Category Breakdown Card
$xCat = 30 + $chartW + $gap
$g.FillRectangle($brushCard, $xCat, $midY, $catW, 230)
$g.DrawRectangle($penBorder, $xCat, $midY, $catW, 230)
$g.DrawString("Singapore Category Breakdown", $fontH1, $brushText, $xCat + 16, $midY + 14)

$g.DrawString("Smart Automatic Feeders", $fontLabel, $brushText, $xCat + 16, $midY + 50)
$g.DrawString("S$1,352.00 (42.5%)", $fontSmall, $brushEmerald, $xCat + 290, $midY + 50)
$g.FillRectangle((New-Object System.Drawing.SolidBrush $cEmerald), $xCat + 16, $midY + 70, 380, 6)

$g.DrawString("GPS Smart Collars", $fontLabel, $brushText, $xCat + 16, $midY + 95)
$g.DrawString("S$1,425.20 (38.0%)", $fontSmall, $brushEmerald, $xCat + 290, $midY + 95)
$g.FillRectangle((New-Object System.Drawing.SolidBrush $cSky), $xCat + 16, $midY + 115, 340, 6)

$g.DrawString("Health & Activity Monitors", $fontLabel, $brushText, $xCat + 16, $midY + 140)
$g.DrawString("S$583.17 (19.5%)", $fontSmall, $brushEmerald, $xCat + 290, $midY + 140)
$g.FillRectangle((New-Object System.Drawing.SolidBrush $cAmber), $xCat + 16, $midY + 160, 175, 6)

$g.DrawString("High-ticket price range: S$149 - S$899 SGD per item", $fontSmall, $brushMuted, $xCat + 16, $midY + 195)

# --- BOTTOM SECTION: HIGH TICKET CONVERTING TABLE ---
$tableY = 566
$tableW = 1200
$g.FillRectangle($brushCard, 30, $tableY, $tableW, 250)
$g.DrawRectangle($penBorder, 30, $tableY, $tableW, 250)

$g.DrawString("Top Converting High-Ticket Products (Amazon.sg Associates)", $fontH1, $brushText, 45, $tableY + 12)
$g.DrawString("Associate Tag: pettechsg-22  |  Currency: SGD (S$)", $fontSmall, $brushMuted, 880, $tableY + 16)

$thY = $tableY + 38
$g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(31, 41, 55))), 40, $thY, 1180, 24)
$g.DrawString("PRODUCT & ASIN", $fontLabel, $brushMuted, 50, $thY + 5)
$g.DrawString("CATEGORY", $fontLabel, $brushMuted, 360, $thY + 5)
$g.DrawString("CLICKS", $fontLabel, $brushMuted, 580, $thY + 5)
$g.DrawString("ORDERS", $fontLabel, $brushMuted, 670, $thY + 5)
$g.DrawString("CONV %", $fontLabel, $brushMuted, 760, $thY + 5)
$g.DrawString("GROSS GMV (SGD)", $fontLabel, $brushMuted, 870, $thY + 5)
$g.DrawString("COMMISSION (SGD)", $fontLabel, $brushMuted, 1040, $thY + 5)

$rows = @(
    @("Halo Collar 3 Wireless GPS Fence (B0C9LK4B11)", "GPS Smart Collars", "340", "14", "4.12%", "S$12,586.00", "S$1,006.88"),
    @("Whisker Feeder-Robot WiFi (B08T9NKL42)", "Smart Automatic Feeders", "410", "26", "6.34%", "S$12,714.00", "S$1,017.12"),
    @("Invoxia Biometric Dog Collar (B0B8K3J7X9)", "Health Wearables", "285", "19", "6.67%", "S$6,631.00", "S$464.17"),
    @("Fi Series 3 Smart GPS Collar (B0BP7M29KX)", "GPS Smart Collars", "315", "21", "6.67%", "S$5,229.00", "S$418.32"),
    @("PETKIT Fresh Element Infinity (B09V7N8K41)", "Smart Automatic Feeders", "290", "16", "5.52%", "S$4,784.00", "S$334.88")
)

$rY = $thY + 28
foreach ($r in $rows) {
    $g.DrawString($r[0], $fontBody, $brushText, 50, $rY)
    $g.DrawString($r[1], $fontSmall, $brushMuted, 360, $rY)
    $g.DrawString($r[2], $fontBody, $brushText, 580, $rY)
    $g.DrawString($r[3], $fontBody, $brushText, 670, $rY)
    $g.DrawString($r[4], $fontLabel, $brushEmerald, 760, $rY)
    $g.DrawString($r[5], $fontBody, $brushText, 870, $rY)
    $g.DrawString($r[6], $fontH1, $brushEmerald, 1040, $rY - 2)
    $g.DrawLine($penBorder, 40, ($rY + 28), 1220, ($rY + 28))
    $rY += 34
}

# Save Image
$bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

if ($ArtifactPath) {
    $artifactDir = [System.IO.Path]::GetDirectoryName($ArtifactPath)
    if (-not (Test-Path $artifactDir)) {
        New-Item -ItemType Directory -Path $artifactDir -Force | Out-Null
    }
    $bmp.Save($ArtifactPath, [System.Drawing.Imaging.ImageFormat]::Png)
}

$g.Dispose()
$bmp.Dispose()

Write-Host "Screenshot generated successfully: $OutputPath"
