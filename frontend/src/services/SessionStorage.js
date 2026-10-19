export default class SessionStorage {
  static TOKEN_KEY = 'kyzen-token';
  static USER_KEY = 'kyzen-user';
  static CURRENCY_KEY = 'kyzen-currency';

  static read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  static write(key, value) {
    try {
      if (value === null || value === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, value);
      }
    } catch {
      return;
    }
  }

  static getToken() {
    return SessionStorage.read(SessionStorage.TOKEN_KEY);
  }

  static getUser() {
    const value = SessionStorage.read(SessionStorage.USER_KEY);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  static saveSession(token, user) {
    SessionStorage.write(SessionStorage.TOKEN_KEY, token);
    SessionStorage.saveUser(user);
  }

  static saveUser(user) {
    SessionStorage.write(SessionStorage.USER_KEY, user ? JSON.stringify(user) : null);
  }

  static clear() {
    SessionStorage.write(SessionStorage.TOKEN_KEY, null);
    SessionStorage.write(SessionStorage.USER_KEY, null);
  }

  static getCurrency() {
    return SessionStorage.read(SessionStorage.CURRENCY_KEY) || 'PEN';
  }

  static saveCurrency(currency) {
    SessionStorage.write(SessionStorage.CURRENCY_KEY, currency);
  }
}
