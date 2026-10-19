export default class FormValidator {
  static MAXIMUM_VOUCHER_BYTES = 5 * 1024 * 1024;
  static VOUCHER_TYPES = ['image/jpeg', 'image/png'];

  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  }

  static isValidPassword(password) {
    const text = String(password || '');
    return text.length >= 8 && /[A-Za-z]/.test(text) && /\d/.test(text);
  }

  static validateTransaction({ type, amount, categoryId, description }) {
    if (!amount || Number(amount) <= 0) return 'Ingresa un monto válido mayor a 0.';
    if (!String(description || '').trim()) return 'Ingresa un concepto o descripción.';
    if (type === 'gasto' && !categoryId) return 'Selecciona una categoría para registrar el gasto.';
    return '';
  }

  static validateVoucher(file) {
    if (!file) return '';
    if (!FormValidator.VOUCHER_TYPES.includes(file.type)) return 'El comprobante debe ser una imagen JPG o PNG.';
    if (file.size > FormValidator.MAXIMUM_VOUCHER_BYTES) return 'El comprobante no puede superar los 5MB.';
    return '';
  }

  static readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
