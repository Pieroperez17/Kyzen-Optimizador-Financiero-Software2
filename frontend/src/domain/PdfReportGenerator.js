import { jsPDF } from 'jspdf';
import MoneyFormatter from './MoneyFormatter.js';

export default class PdfReportGenerator {
  static PERIOD_LABELS = { month: 'Mes actual', year: 'Año actual', all: 'Todo el historial' };

  constructor(formatter) {
    this.formatter = formatter;
    this.document = new jsPDF({ unit: 'mm', format: 'a4' });
    this.positionY = 20;
  }

  write(text, { size = 10, bold = false, color = [15, 23, 42], positionX = 15 } = {}) {
    this.document.setFont('helvetica', bold ? 'bold' : 'normal');
    this.document.setFontSize(size);
    this.document.setTextColor(...color);
    this.document.text(String(text), positionX, this.positionY);
  }

  nextLine(height = 6) {
    this.positionY += height;
    if (this.positionY > 280) {
      this.document.addPage();
      this.positionY = 20;
    }
  }

  writeHeader(user, period) {
    this.write('Kyzen - Reporte financiero', { size: 18, bold: true, color: [79, 70, 229] });
    this.nextLine(8);
    this.write(`${user.firstName} ${user.lastName} · ${user.email}`, { color: [71, 85, 105] });
    this.nextLine();
    this.write(`Periodo: ${PdfReportGenerator.PERIOD_LABELS[period]} · Generado: ${MoneyFormatter.formatDate(new Date())}`, { color: [71, 85, 105] });
    this.nextLine(10);
  }

  writeTotals(transactions) {
    const income = transactions.filter((item) => item.type === 'ingreso').reduce((total, item) => total + item.amount, 0);
    const expense = transactions.filter((item) => item.type === 'gasto').reduce((total, item) => total + item.amount, 0);
    this.write('Resumen', { size: 13, bold: true });
    this.nextLine(7);
    this.write(`Ingresos: ${this.formatter.format(income)}`);
    this.nextLine();
    this.write(`Gastos: ${this.formatter.format(expense)}`);
    this.nextLine();
    this.write(`Balance: ${this.formatter.format(income - expense)}`, { bold: true });
    this.nextLine(10);
  }

  writeTransactions(transactions) {
    this.write('Movimientos', { size: 13, bold: true });
    this.nextLine(7);
    const columns = [15, 42, 65, 105, 165];
    ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'].forEach((title, index) => {
      this.write(title, { bold: true, positionX: columns[index], color: [71, 85, 105] });
    });
    this.nextLine(2);
    this.document.setDrawColor(203, 213, 225);
    this.document.line(15, this.positionY, 195, this.positionY);
    this.nextLine(5);

    if (!transactions.length) {
      this.write('No hay movimientos registrados en este periodo.', { color: [100, 116, 139] });
      return;
    }

    transactions.forEach((transaction) => {
      const sign = transaction.type === 'gasto' ? '-' : '+';
      const values = [
        new Date(transaction.date).toLocaleDateString('es-PE'),
        transaction.type === 'gasto' ? 'Gasto' : 'Ingreso',
        transaction.category ? transaction.category.name : 'Sin categoría',
        String(transaction.description).slice(0, 32),
        `${sign} ${this.formatter.format(transaction.amount)}`
      ];
      values.forEach((value, index) => this.write(value, { positionX: columns[index] }));
      this.nextLine();
    });
  }

  generate({ user, transactions, period }) {
    this.writeHeader(user, period);
    this.writeTotals(transactions);
    this.writeTransactions(transactions);
    this.document.save(`kyzen-reporte-${period}.pdf`);
  }
}
