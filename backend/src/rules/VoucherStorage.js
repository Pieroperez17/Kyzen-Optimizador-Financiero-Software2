import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export default class VoucherStorage {
  static ALLOWED_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png' };
  static MAXIMUM_BYTES = 5 * 1024 * 1024;

  constructor(directory) {
    this.directory = path.resolve(directory);
  }

  static validateVoucher({ mimeType, sizeBytes }) {
    const errors = [];
    if (!VoucherStorage.ALLOWED_TYPES[mimeType]) errors.push('El comprobante debe ser JPG o PNG.');
    if (!(sizeBytes > 0) || sizeBytes > VoucherStorage.MAXIMUM_BYTES) {
      errors.push('El comprobante no puede superar los 5MB.');
    }
    return errors;
  }

  save({ mimeType, data }) {
    const base64 = String(data || '').replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    const errors = VoucherStorage.validateVoucher({ mimeType, sizeBytes: buffer.length });
    if (errors.length) {
      throw new Error(errors.join(' '));
    }
    fs.mkdirSync(this.directory, { recursive: true });
    const fileName = `${randomUUID()}.${VoucherStorage.ALLOWED_TYPES[mimeType]}`;
    fs.writeFileSync(path.join(this.directory, fileName), buffer);
    return { url: `/uploads/${fileName}` };
  }

  remove(voucherUrl) {
    if (!voucherUrl) {
      return;
    }
    const filePath = path.join(this.directory, path.basename(voucherUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
