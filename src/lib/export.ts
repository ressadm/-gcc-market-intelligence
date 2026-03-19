/**
 * Export data to CSV file and trigger download.
 * Uses Blob + URL.createObjectURL — no external dependencies.
 */
export function exportToCSV(
  headers: string[],
  rows: (string | number | null)[][],
  filename: string
): void {
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row.map(cell => {
        const str = cell === null || cell === undefined ? '' : String(cell)
        // Escape commas, quotes, and newlines
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(',')
    ),
  ].join('\n')

  // BOM for correct Excel encoding
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
