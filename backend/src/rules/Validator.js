export default class Validator {
  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  }

  static isValidPassword(password) {
    const text = String(password || '');
    return text.length >= 8 && /[A-Za-z]/.test(text) && /\d/.test(text);
  }

  static validateRegistrationInput({ firstName, lastName, birthDate, email, password }) {
    const errors = [];
    if (!String(firstName || '').trim()) errors.push('El nombre es obligatorio.');
    if (!String(lastName || '').trim()) errors.push('El apellido es obligatorio.');
    if (!birthDate || Number.isNaN(new Date(birthDate).getTime())) errors.push('La fecha de nacimiento no es válida.');
    if (!Validator.isValidEmail(email)) errors.push('El correo electrónico no tiene un formato válido.');
    if (!Validator.isValidPassword(password)) {
      errors.push('La contraseña debe tener al menos 8 caracteres, con letras y números.');
    }
    return errors;
  }

  static validateTransactionInput({ type, amount, categoryId }) {
    const errors = [];
    const normalizedType = String(type || '').toLowerCase();
    if (!['ingreso', 'gasto'].includes(normalizedType)) errors.push('El tipo debe ser ingreso o gasto.');
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) errors.push('El monto debe ser un número mayor a 0.');
    if (normalizedType === 'gasto' && !categoryId) errors.push('La categoría es obligatoria al registrar un gasto.');
    return errors;
  }

  static validateGoalInput({ name, targetAmount, deadline }) {
    const errors = [];
    if (!String(name || '').trim()) errors.push('El nombre de la meta es obligatorio.');
    const parsedAmount = Number(targetAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) errors.push('El monto objetivo debe ser mayor a 0.');
    if (!deadline || Number.isNaN(new Date(deadline).getTime())) errors.push('La fecha límite no es válida.');
    return errors;
  }
}
