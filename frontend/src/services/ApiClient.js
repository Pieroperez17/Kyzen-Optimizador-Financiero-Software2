import SessionStorage from './SessionStorage.js';

export class ApiError extends Error {
  constructor(status, message, data = {}) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export default class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.unauthorizedListener = null;
  }

  onUnauthorized(listener) {
    this.unauthorizedListener = listener;
  }

  buildHeaders(hasBody) {
    const headers = {};
    const token = SessionStorage.getToken();
    if (hasBody) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async send(method, path, body) {
    let response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.buildHeaders(body !== undefined),
        body: body !== undefined ? JSON.stringify(body) : undefined
      });
    } catch {
      throw new ApiError(0, 'No se pudo conectar con el servidor. Verifica tu conexión.');
    }

    if (response.status === 401 && SessionStorage.getToken() && this.unauthorizedListener) {
      this.unauthorizedListener();
    }
    return response;
  }

  async request(method, path, body) {
    const response = await this.send(method, path, body);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'Ocurrió un error inesperado.', data);
    }
    return data;
  }

  get(path) {
    return this.request('GET', path);
  }

  post(path, body = {}) {
    return this.request('POST', path, body);
  }

  put(path, body = {}) {
    return this.request('PUT', path, body);
  }

  delete(path) {
    return this.request('DELETE', path);
  }

  async download(path, fileName) {
    const response = await this.send('GET', path);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(response.status, data.message || 'No se pudo descargar el archivo.');
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_URL || '/api');
