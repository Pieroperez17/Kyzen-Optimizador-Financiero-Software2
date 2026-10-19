import { Router } from 'express';

export default class CategoryRoutes {
  constructor(controller, authenticationMiddleware) {
    this.controller = controller;
    this.authenticationMiddleware = authenticationMiddleware;
  }

  createRouter() {
    const router = Router();

    router.use(this.authenticationMiddleware.protect);
    router.get('/', this.controller.list);
    router.post('/', this.controller.create);

    return router;
  }
}
