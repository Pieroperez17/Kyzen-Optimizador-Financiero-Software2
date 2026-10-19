import Validator from '../rules/Validator.js';
import VerificationCode from '../services/VerificationCode.js';
import HttpError from '../services/HttpError.js';

export default class AuthenticationController {
  static INVALID_CREDENTIALS = 'Credenciales inválidas.';

  constructor({ User, tokenService, mailService }) {
    this.User = User;
    this.tokenService = tokenService;
    this.mailService = mailService;
  }

  static normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  async findUserByEmail(email) {
    return this.User.findOne({ where: { email: AuthenticationController.normalizeEmail(email) } });
  }

  async sendVerificationCode(user) {
    const code = VerificationCode.generate();
    user.verificationCode = code;
    user.verificationExpires = VerificationCode.expirationDate();
    await user.save();
    await this.mailService.sendCode(user.email, code, 'verification');
  }

  sessionResponse(user) {
    return { success: true, token: this.tokenService.create(user), user: user.toProfileView() };
  }

  register = async (request, response) => {
    const { firstName, lastName, birthDate, phone, email, password } = request.body;
    const errors = Validator.validateRegistrationInput({ firstName, lastName, birthDate, email, password });
    if (errors.length) {
      throw HttpError.badRequest(errors.join(' '), errors);
    }

    const normalizedEmail = AuthenticationController.normalizeEmail(email);
    let user = await this.findUserByEmail(normalizedEmail);
    if (user && user.isVerified) {
      throw HttpError.conflict('Ya existe una cuenta registrada con este correo.');
    }

    const data = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate,
      phone: phone ? String(phone).trim() : null,
      email: normalizedEmail,
      password
    };

    if (user) {
      user.set(data);
    } else {
      user = this.User.build(data);
    }
    await this.sendVerificationCode(user);

    response.status(201).json({
      success: true,
      message: 'Cuenta creada. Revisa tu correo e ingresa el código de verificación.',
      email: normalizedEmail
    });
  };

  verifyOtp = async (request, response) => {
    const user = await this.findUserByEmail(request.body.email);
    if (!user || !VerificationCode.isValid(user.verificationCode, user.verificationExpires, request.body.code)) {
      throw HttpError.badRequest('El código es inválido o ya venció.');
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpires = null;
    await user.save();

    response.status(201).json(this.sessionResponse(user));
  };

  resendOtp = async (request, response) => {
    const user = await this.findUserByEmail(request.body.email);
    if (user && !user.isVerified) {
      await this.sendVerificationCode(user);
    }
    response.json({ success: true, message: 'Si la cuenta está pendiente de verificación, enviamos un nuevo código.' });
  };

  login = async (request, response) => {
    const user = await this.findUserByEmail(request.body.email);
    const isPasswordCorrect = user ? await user.matchPassword(String(request.body.password || '')) : false;
    if (!user || !isPasswordCorrect) {
      throw HttpError.unauthorized(AuthenticationController.INVALID_CREDENTIALS);
    }

    if (!user.isVerified) {
      await this.sendVerificationCode(user);
      return response.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: 'Debes verificar tu correo. Te enviamos un nuevo código.'
      });
    }

    response.json(this.sessionResponse(user));
  };

  forgotPassword = async (request, response) => {
    const user = await this.findUserByEmail(request.body.email);
    if (user) {
      const code = VerificationCode.generate();
      user.resetPasswordToken = code;
      user.resetPasswordExpires = VerificationCode.expirationDate();
      await user.save();
      await this.mailService.sendCode(user.email, code, 'reset');
    }
    response.json({ success: true, message: 'Si el correo está registrado, recibirás un código de recuperación.' });
  };

  verifyCode = async (request, response) => {
    const user = await this.findUserByEmail(request.body.email);
    if (!user || !VerificationCode.isValid(user.resetPasswordToken, user.resetPasswordExpires, request.body.code)) {
      throw HttpError.badRequest('El código es inválido o ya venció.');
    }
    response.json({ success: true, message: 'Código verificado. Ahora crea tu nueva contraseña.' });
  };

  resetPassword = async (request, response) => {
    const { email, code, password } = request.body;
    const user = await this.findUserByEmail(email);
    if (!user || !VerificationCode.isValid(user.resetPasswordToken, user.resetPasswordExpires, code)) {
      throw HttpError.badRequest('El código es inválido o ya venció.');
    }
    if (!Validator.isValidPassword(password)) {
      throw HttpError.badRequest('La contraseña debe tener al menos 8 caracteres, con letras y números.');
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    response.json({ success: true, message: 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.' });
  };

  getProfile = async (request, response) => {
    response.json({ success: true, user: request.user.toProfileView() });
  };

  updateProfile = async (request, response) => {
    const { firstName, lastName, phone } = request.body;
    if (!String(firstName || '').trim() || !String(lastName || '').trim()) {
      throw HttpError.badRequest('El nombre y el apellido son obligatorios.');
    }

    request.user.firstName = firstName.trim();
    request.user.lastName = lastName.trim();
    request.user.phone = phone ? String(phone).trim() : null;
    await request.user.save();

    response.json({ success: true, message: 'Perfil actualizado.', user: request.user.toProfileView() });
  };

  updateBudget = async (request, response) => {
    const { monthlyBudget } = request.body;
    const isEmpty = monthlyBudget === null || monthlyBudget === '' || monthlyBudget === undefined;
    const value = Number(monthlyBudget);
    if (!isEmpty && (!Number.isFinite(value) || value < 0)) {
      throw HttpError.badRequest('El presupuesto mensual debe ser un número mayor o igual a 0.');
    }

    request.user.monthlyBudget = isEmpty ? null : value;
    await request.user.save();

    response.json({ success: true, message: 'Presupuesto mensual actualizado.', user: request.user.toProfileView() });
  };

  changePassword = async (request, response) => {
    const { currentPassword, newPassword } = request.body;
    if (!(await request.user.matchPassword(String(currentPassword || '')))) {
      throw HttpError.unauthorized('La contraseña actual no es correcta.');
    }
    if (!Validator.isValidPassword(newPassword)) {
      throw HttpError.badRequest('La nueva contraseña debe tener al menos 8 caracteres, con letras y números.');
    }

    request.user.password = newPassword;
    await request.user.save();

    response.json({ success: true, message: 'Contraseña actualizada correctamente.' });
  };
}
