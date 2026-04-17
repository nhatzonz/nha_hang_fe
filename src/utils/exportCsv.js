/**
 * Export array of objects to CSV file and download.
 * columns: [{ key, label, format? }]
 */
export const exportToCsv = (filename, columns, rows) => {
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const header = columns.map((c) => escape(c.label)).join(',');
  const body = rows.map((row) =>
    columns.map((c) => {
      const raw = c.key.split('.').reduce((acc, k) => acc?.[k], row);
      return escape(c.format ? c.format(raw, row) : raw);
    }).join(','),
  );

  // BOM để Excel hiểu UTF-8
  const csv = '\uFEFF' + [header, ...body].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
