import { randomInt } from 'node:crypto';

export default class VerificationCode {
  static VALIDITY_MINUTES = 15;

  static generate() {
    return String(randomInt(0, 1000000)).padStart(6, '0');
  }

  static expirationDate() {
    return new Date(Date.now() + VerificationCode.VALIDITY_MINUTES * 60 * 1000);
  }

  static isValid(storedCode, expirationDate, receivedCode) {
    if (!storedCode || !expirationDate) {
      return false;
    }
    return storedCode === String(receivedCode || '').trim() && new Date(expirationDate) > new Date();
  }
}
