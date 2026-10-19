import { Router } from 'express';

export default class DashboardRoutes {
  constructor(controller, authenticationMiddleware) {
    this.controller = controller;
    this.authenticationMiddleware = authenticationMiddleware;
  }

  createRouter() {
    const router = Router();

    router.use(this.authenticationMiddleware.protect);
    router.get('/summary', this.controller.summary);

    return router;
  }
}
