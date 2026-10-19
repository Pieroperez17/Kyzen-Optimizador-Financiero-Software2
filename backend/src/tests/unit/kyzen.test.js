import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Validator from '../../rules/Validator.js';
import AlertEngine from '../../rules/AlertEngine.js';
import CurrencyConverter from '../../rules/CurrencyConverter.js';
import CsvExporter from '../../rules/CsvExporter.js';
import VoucherStorage from '../../rules/VoucherStorage.js';
import PeriodRange from '../../rules/PeriodRange.js';

describe('HU-07 registro de usuario', () => {
  test('valida el formato del correo', () => {
    assert.equal(Validator.isValidEmail('estudiante@universidad.edu.pe'), true);
    assert.equal(Validator.isValidEmail('malo'), false);
  });

  test('exige contraseña alfanumérica de al menos 8 caracteres', () => {
    assert.equal(Validator.isValidPassword('clave123'), true);
    assert.equal(Validator.isValidPassword('corta1'), false);
    assert.equal(Validator.isValidPassword('solamenteletras'), false);
  });
});

describe('HU-01 registro de transacciones', () => {
  test('rechaza montos iguales a 0 o negativos', () => {
    assert.equal(Validator.validateTransactionInput({ type: 'gasto', amount: 0, categoryId: 1 }).length, 1);
    assert.equal(Validator.validateTransactionInput({ type: 'gasto', amount: -5, categoryId: 1 }).length, 1);
  });

  test('exige categoría en los gastos pero no en los ingresos', () => {
    assert.equal(Validator.validateTransactionInput({ type: 'gasto', amount: 50 }).length, 1);
    assert.equal(Validator.validateTransactionInput({ type: 'ingreso', amount: 50 }).length, 0);
  });
});

describe('HU-20 motor de alertas por umbral', () => {
  test('sin presupuesto no hay alerta', () => {
    assert.equal(AlertEngine.evaluateBudgetAlert(500, null).triggered, false);
    assert.equal(AlertEngine.evaluateBudgetAlert(500, 0).level, 'none');
  });

  test('exactamente el 80% no dispara la alerta y por encima sí', () => {
    assert.equal(AlertEngine.ALERT_THRESHOLD, 0.8);
    assert.equal(AlertEngine.evaluateBudgetAlert(800, 1000).triggered, false);
    const alert = AlertEngine.evaluateBudgetAlert(801, 1000);
    assert.equal(alert.triggered, true);
    assert.equal(alert.level, 'red');
    assert.match(alert.message, /80%/);
  });

  test('por encima del 100% informa que se superó el presupuesto', () => {
    const alert = AlertEngine.evaluateBudgetAlert(1500, 1000);
    assert.equal(alert.percentage, 150);
    assert.match(alert.message, /Superaste/);
  });

  test('suma solo los gastos del mes actual', () => {
    const referenceDate = new Date(2026, 9, 15);
    const transactions = [
      { type: 'gasto', amount: 100, date: new Date(2026, 9, 2) },
      { type: 'gasto', amount: 50, date: new Date(2026, 8, 30) },
      { type: 'ingreso', amount: 900, date: new Date(2026, 9, 3) }
    ];
    assert.equal(AlertEngine.sumMonthlyExpenses(transactions, referenceDate), 100);
  });
});

describe('Metas de ahorro y divisa', () => {
  test('convierte soles a dólares con el tipo de cambio configurado', () => {
    const converter = new CurrencyConverter(3.75);
    assert.equal(converter.convert(3750, 'USD'), 1000);
    assert.equal(converter.convert(375, 'PEN'), 375);
    assert.equal(converter.toSoles(100, 'USD'), 375);
  });

  test('normaliza monedas no soportadas a PEN', () => {
    assert.equal(CurrencyConverter.normalize('eur'), 'PEN');
    assert.equal(CurrencyConverter.normalize('usd'), 'USD');
  });
});

describe('HU-13 exportación CSV', () => {
  test('escapa fórmulas y comas', () => {
    assert.equal(CsvExporter.escapeCell('=SUMA(A1)'), "'=SUMA(A1)");
    assert.equal(CsvExporter.escapeCell('pan, leche'), '"pan, leche"');
  });

  test('genera encabezado y filas', () => {
    const csv = CsvExporter.buildTransactionsCsv([
      { date: new Date('2026-10-01T12:00:00Z'), type: 'gasto', category: { name: 'Comida' }, description: 'Almuerzo', amount: 15 }
    ]);
    const lines = csv.split('\n');
    assert.equal(lines.length, 2);
    assert.equal(lines[1], '2026-10-01,gasto,Comida,Almuerzo,15.00');
  });
});

describe('HU-03 comprobantes de pago', () => {
  test('solo acepta JPG o PNG de hasta 5MB', () => {
    assert.equal(VoucherStorage.validateVoucher({ mimeType: 'image/png', sizeBytes: 1024 }).length, 0);
    assert.equal(VoucherStorage.validateVoucher({ mimeType: 'application/pdf', sizeBytes: 1024 }).length, 1);
    assert.equal(VoucherStorage.validateVoucher({ mimeType: 'image/jpeg', sizeBytes: 6 * 1024 * 1024 }).length, 1);
  });

  test('guarda el archivo y devuelve su URL pública', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'kyzen-'));
    const storage = new VoucherStorage(directory);
    const result = storage.save({ mimeType: 'image/png', data: `data:image/png;base64,${Buffer.from('imagen').toString('base64')}` });
    assert.match(result.url, /^\/uploads\/.+\.png$/);
    assert.equal(fs.readdirSync(directory).length, 1);
    fs.rmSync(directory, { recursive: true, force: true });
  });
});

describe('Filtro por periodo', () => {
  test('calcula el rango del mes', () => {
    const range = new PeriodRange('month', new Date(2026, 9, 18));
    assert.deepEqual(range.start(), new Date(2026, 9, 1));
    assert.deepEqual(range.end(), new Date(2026, 10, 1));
    assert.equal(new PeriodRange('all').start(), null);
  });
});
