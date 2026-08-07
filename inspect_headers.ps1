$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$wb = $excel.Workbooks.Open((Get-Item 'QuestionBank.xlsx').FullName)
foreach ($sheet in $wb.Sheets) {
  $headers = @()
  $range = $sheet.UsedRange
  if ($range.Rows.Count -ge 1) {
    for ($c = 1; $c -le $range.Columns.Count; $c++) {
      $headers += $sheet.Cells.Item(1, $c).Text
    }
  }
  Write-Host 'Sheet:' $sheet.Name
  Write-Host ($headers -join ' | ')
  Write-Host ''
}
$wb.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
