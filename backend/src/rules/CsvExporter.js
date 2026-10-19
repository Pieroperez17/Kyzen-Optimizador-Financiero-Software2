export default class CsvExporter {
  static HEADERS = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto (S/)'];

  static escapeCell(value) {
    let text = value === null || value === undefined ? '' : String(value);
    if (/^[=+\-@]/.test(text)) {
      text = `'${text}`;
    }
    if (/[",\n;]/.test(text)) {
      text = `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  static buildTransactionsCsv(transactions) {
    const rows = transactions.map((transaction) => [
      new Date(transaction.date).toISOString().slice(0, 10),
      transaction.type,
      transaction.category ? transaction.category.name : 'Sin categoría',
      transaction.description,
      Number(transaction.amount).toFixed(2)
    ]);
    return [CsvExporter.HEADERS, ...rows]
      .map((row) => row.map((cell) => CsvExporter.escapeCell(cell)).join(','))
      .join('\n');
  }
}
