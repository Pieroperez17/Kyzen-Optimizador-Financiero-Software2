import { Router } from 'express';

export default class AuthenticationRoutes {
  constructor(controller, authenticationMiddleware) {
    this.controller = controller;
    this.authenticationMiddleware = authenticationMiddleware;
  }

  createRouter() {
    const router = Router();
    const protect = this.authenticationMiddleware.protect;

    router.post('/register', this.controller.register);
    router.post('/verify-otp', this.controller.verifyOtp);
    router.post('/resend-otp', this.controller.resendOtp);
    router.post('/login', this.controller.login);
    router.post('/forgot-password', this.controller.forgotPassword);
    router.post('/verify-code', this.controller.verifyCode);
    router.post('/reset-password', this.controller.resetPassword);
    router.get('/profile', protect, this.controller.getProfile);
    router.put('/profile', protect, this.controller.updateProfile);
    router.put('/budget', protect, this.controller.updateBudget);
    router.put('/change-password', protect, this.controller.changePassword);

    return router;
  }
}
