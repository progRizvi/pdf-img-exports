param([String]$directory=".\fonts")

Write-Host "Converting CFF to WOFF"
Write-Host "Directory: $directory"

$files = Get-ChildItem -Path $directory -Recurse -Filter *.cff

Write-Host $files

if ($files.Count -gt 0)
{
  for ($i=0; $i -lt $files.Count; $i++)
  {
    $targetFile = $files[$i].FullName
    $outputDir = Split-Path $targetFile -Parent
    $fileName = Split-Path $targetFile -Leaf
    $outputPath = "$outputDir\$fileName"
    $outputPath = $outputPath -replace '.cff', '.woff'
    Write-Output "Converting $targetFile to $outputPath"

    Invoke-Command { fontforge -lang=ff -c 'Open($1); Generate($2)' $targetFile $outputPath }
  }
}

#Invoke-Command fontforge -lang=ff -c 'Open($1); Generate($2)' .\font-0196.cff .\font-0196.woff