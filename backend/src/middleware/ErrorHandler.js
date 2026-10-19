export default class ErrorHandler {
  static notFound(request, response) {
    response.status(404).json({ success: false, message: 'Ruta no encontrada.' });
  }

  static handle(error, request, response, next) {
    if (error.type === 'entity.too.large') {
      return response.status(413).json({ success: false, message: 'El archivo enviado es demasiado grande.' });
    }

    const status = error.status || 500;
    if (status === 500) {
      console.error('[Kyzen] Error interno:', error);
    }

    response.status(status).json({
      success: false,
      message: status === 500 ? 'Ocurrió un error interno. Inténtalo más tarde.' : error.message,
      errors: error.errors || []
    });
  }
}
