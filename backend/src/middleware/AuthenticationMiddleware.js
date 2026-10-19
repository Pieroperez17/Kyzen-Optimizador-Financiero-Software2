import HttpError from '../services/HttpError.js';

export default class AuthenticationMiddleware {
  constructor(tokenService, User) {
    this.tokenService = tokenService;
    this.User = User;
  }

  protect = async (request, response, next) => {
    const header = request.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      throw HttpError.unauthorized('Debes iniciar sesión para continuar.');
    }

    let payload;
    try {
      payload = this.tokenService.verify(header.slice(7));
    } catch {
      throw HttpError.unauthorized('Tu sesión expiró. Inicia sesión nuevamente.');
    }

    const user = await this.User.findByPk(payload.id);
    if (!user) {
      throw HttpError.unauthorized('Tu sesión ya no es válida.');
    }

    request.user = user;
    next();
  };
}
