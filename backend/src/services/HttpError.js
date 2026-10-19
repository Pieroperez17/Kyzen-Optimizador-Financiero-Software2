export default class HttpError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors = []) {
    return new HttpError(400, message, errors);
  }

  static unauthorized(message = 'No autorizado.') {
    return new HttpError(401, message);
  }

  static forbidden(message) {
    return new HttpError(403, message);
  }

  static notFound(message = 'Recurso no encontrado.') {
    return new HttpError(404, message);
  }

  static conflict(message) {
    return new HttpError(409, message);
  }
}
