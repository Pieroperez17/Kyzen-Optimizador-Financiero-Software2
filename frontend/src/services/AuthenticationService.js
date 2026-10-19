import { apiClient } from './ApiClient.js';

class AuthenticationService {
  constructor(client) {
    this.client = client;
  }

  register(data) {
    return this.client.post('/auth/register', data);
  }

  verifyAccount(email, code) {
    return this.client.post('/auth/verify-otp', { email, code });
  }

  resendCode(email) {
    return this.client.post('/auth/resend-otp', { email });
  }

  login(email, password) {
    return this.client.post('/auth/login', { email, password });
  }

  forgotPassword(email) {
    return this.client.post('/auth/forgot-password', { email });
  }

  verifyResetCode(email, code) {
    return this.client.post('/auth/verify-code', { email, code });
  }

  resetPassword(email, code, password) {
    return this.client.post('/auth/reset-password', { email, code, password });
  }

  getProfile() {
    return this.client.get('/auth/profile');
  }

  updateProfile(data) {
    return this.client.put('/auth/profile', data);
  }

  updateBudget(monthlyBudget) {
    return this.client.put('/auth/budget', { monthlyBudget });
  }

  changePassword(currentPassword, newPassword) {
    return this.client.put('/auth/change-password', { currentPassword, newPassword });
  }
}

export const authenticationService = new AuthenticationService(apiClient);
