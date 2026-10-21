<#
Shrinks the .mp4 files in your img folder for the web. Your originals are not touched.

  1) Compress:   .\compress-videos.ps1
        Writes smaller copies to  Desktop\video-compressed  (same folder structure and file names).
        Safe to stop and re-run: finished files are skipped.
  2) Look at a few of the copies. Then, when you're happy:
  3) Apply:      .\compress-videos.ps1 -Apply
        Saves your originals to  Desktop\video-originals,  then copies the smaller videos into img.

Run it from the site folder (the one that contains img). Needs ffmpeg:  winget install Gyan.FFmpeg
(then close and reopen PowerShell).

What it does to each video:
  - H.264 video, quality setting 26, "slow" preset (small files, plays in every browser)
  - never bigger than 1920px on its longest side (4K recordings come down to 1080p)
  - keeps the frame rate and keeps audio if there is any (AAC 96k)
  - moves the index to the front of the file so playback starts right away
  - keeps the original instead if the new file isn't at least 10% smaller
  - skips videos under 2 MB
#>
param(
    [string]$Source = (Join-Path (Get-Location) 'img'),
    [string]$Out = (Join-Path $HOME 'Desktop\video-compressed'),
    [string]$Backup = (Join-Path $HOME 'Desktop\video-originals'),
    [switch]$Apply,
    [int]$Crf = 26,
    [int]$MaxEdge = 1920,
    [double]$MinMB = 2
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $Source)) { throw "Can't find '$Source'. Run this from the site folder, or pass -Source <path to img>." }
$Source = (Resolve-Path $Source).Path

function Get-Rel($path, $root) { $path.Substring($root.Length).TrimStart('\', '/') }
function Format-MB($bytes) { '{0:N1} MB' -f ($bytes / 1MB) }

# ---------------- Apply ----------------
if ($Apply) {
    if (-not (Test-Path $Out)) { throw "Nothing to apply: '$Out' doesn't exist. Run without -Apply first." }
    $Out = (Resolve-Path $Out).Path
    $new = Get-ChildItem -Path $Out -Recurse -File | Where-Object { $_.Extension -ieq '.mp4' }
    $before = 0; $after = 0; $n = 0
    foreach ($c in $new) {
        $rel = Get-Rel $c.FullName $Out
        $orig = Join-Path $Source $rel
        if (-not (Test-Path -LiteralPath $orig)) { Write-Host "Skipping (no original in img): $rel"; continue }
        $bak = Join-Path $Backup $rel
        if (-not (Test-Path -LiteralPath $bak)) {
            New-Item -ItemType Directory -Force -Path (Split-Path $bak) | Out-Null
            Copy-Item -LiteralPath $orig -Destination $bak
        }
        $before += (Get-Item -LiteralPath $orig).Length
        Copy-Item -LiteralPath $c.FullName -Destination $orig -Force
        $after += $c.Length; $n++
    }
    Write-Host ''
    Write-Host "Replaced $n videos in img: $(Format-MB $before) -> $(Format-MB $after)."
    Write-Host "Originals are saved in $Backup."
    return
}

# ---------------- Compress ----------------
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    throw 'ffmpeg not found. Install it with:  winget install Gyan.FFmpeg   (then close and reopen PowerShell)'
}

$vf = "scale='min($MaxEdge,iw)':'min($MaxEdge,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,format=yuv420p"

$files = Get-ChildItem -Path $Source -Recurse -File | Where-Object { $_.Extension -ieq '.mp4' } | Sort-Object Length -Descending
$total = $files.Count
$i = 0; $done = 0; $kept = 0; $skipped = 0; $failed = 0
$sumBefore = 0; $sumAfter = 0

foreach ($f in $files) {
    $i++
    $rel = Get-Rel $f.FullName $Source
    $dest = Join-Path $Out $rel
    $marker = "$dest.kept"

    if ($f.Length -lt ($MinMB * 1MB)) { $skipped++; continue }
    if (Test-Path -LiteralPath $marker) { $kept++; continue }
    if (Test-Path -LiteralPath $dest) {
        $sumBefore += $f.Length; $sumAfter += (Get-Item -LiteralPath $dest).Length; $done++
        continue
    }

    New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
    $tmp = Join-Path (Split-Path $dest) ('~' + [IO.Path]::GetFileNameWithoutExtension($dest) + '.tmp.mp4')
    Write-Host ("[{0}/{1}] {2}  ({3})" -f $i, $total, $rel, (Format-MB $f.Length))

    $ff = @(
        '-v', 'error', '-y',
        '-i', $f.FullName,
        '-map', '0:v:0', '-map', '0:a:0?',
        '-vf', $vf,
        '-c:v', 'libx264', '-preset', 'slow', '-crf', "$Crf", '-profile:v', 'high',
        '-movflags', '+faststart',
        '-c:a', 'aac', '-b:a', '96k',
        $tmp
    )
    & ffmpeg @ff
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $tmp)) {
        Write-Host "   FAILED, original left as it is." -ForegroundColor Yellow
        if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force }
        $failed++
        continue
    }

    $newLen = (Get-Item -LiteralPath $tmp).Length
    if ($newLen -ge ($f.Length * 0.9)) {
        Remove-Item -LiteralPath $tmp -Force
        New-Item -ItemType File -Force -Path $marker | Out-Null
        Write-Host "   not worth it ($(Format-MB $newLen)), keeping the original"
        $kept++
        continue
    }

    Move-Item -LiteralPath $tmp -Destination $dest -Force
    Write-Host "   -> $(Format-MB $newLen)"
    $sumBefore += $f.Length; $sumAfter += $newLen; $done++
}

Write-Host ''
Write-Host "Compressed $done videos: $(Format-MB $sumBefore) -> $(Format-MB $sumAfter)"
Write-Host "Kept original: $kept   Skipped (under $MinMB MB): $skipped   Failed: $failed"
Write-Host "Copies are in $Out. Check a few, then run:  .\compress-videos.ps1 -Apply"
