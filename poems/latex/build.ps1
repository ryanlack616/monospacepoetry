# build.ps1 - Compile self-executing art LaTeX document
# Handles multi-pass compilation and build counter

param(
    [switch]$Clean,
    [switch]$Watch
)

$ErrorActionPreference = "Stop"
$script:BuildDir = $PSScriptRoot
$script:MainDoc = "self.tex"

function Write-Status($msg) {
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $msg" -ForegroundColor Cyan
}

function Clean-Build {
    Write-Status "Cleaning build artifacts..."
    $extensions = @("aux", "log", "out", "toc", "fls", "fdb_latexmk", "synctex.gz")
    foreach ($ext in $extensions) {
        Get-ChildItem -Path $BuildDir -Filter "*.$ext" -Recurse | Remove-Item -Force
    }
    Write-Status "Clean complete"
}

function Compile-Document {
    Write-Status "Compiling $MainDoc (pass 1/3)..."
    $result1 = & pdflatex -interaction=nonstopmode -shell-escape $MainDoc 2>&1
    
    Write-Status "Compiling $MainDoc (pass 2/3)..."
    $result2 = & pdflatex -interaction=nonstopmode -shell-escape $MainDoc 2>&1
    
    Write-Status "Compiling $MainDoc (pass 3/3)..."
    $result3 = & pdflatex -interaction=nonstopmode -shell-escape $MainDoc 2>&1
    
    # Check for PDF output
    if (Test-Path "self.pdf") {
        $pdfInfo = Get-Item "self.pdf"
        $pages = (Get-Content "self.log" | Select-String "Output written on self.pdf \((\d+) pages" | 
            ForEach-Object { $_.Matches.Groups[1].Value })
        Write-Status "Success: self.pdf ($pages pages, $([math]::Round($pdfInfo.Length/1024))KB)"
        
        # Show build count
        if (Test-Path "buildcount.dat") {
            $buildNum = Get-Content "buildcount.dat"
            Write-Host "  Build #$buildNum" -ForegroundColor Green
        }
    } else {
        Write-Host "ERROR: PDF not generated" -ForegroundColor Red
        Write-Host ($result3 | Select-Object -Last 20)
        exit 1
    }
}

# Main execution
Push-Location $BuildDir
try {
    if ($Clean) {
        Clean-Build
    }
    
    if ($Watch) {
        Write-Status "Watching for changes... (Ctrl+C to stop)"
        $lastWrite = @{}
        while ($true) {
            $files = Get-ChildItem -Path $BuildDir -Include "*.tex" -Recurse
            $changed = $false
            foreach ($f in $files) {
                if ($lastWrite[$f.FullName] -ne $f.LastWriteTime) {
                    if ($lastWrite.Count -gt 0) { $changed = $true }
                    $lastWrite[$f.FullName] = $f.LastWriteTime
                }
            }
            if ($changed) {
                Write-Status "Change detected, recompiling..."
                Compile-Document
            }
            Start-Sleep -Seconds 2
        }
    } else {
        Compile-Document
    }
} finally {
    Pop-Location
}
