import { Router } from 'express';

export default class TransactionRoutes {
  constructor(controller, authenticationMiddleware) {
    this.controller = controller;
    this.authenticationMiddleware = authenticationMiddleware;
  }

  createRouter() {
    const router = Router();

    router.use(this.authenticationMiddleware.protect);
    router.get('/', this.controller.list);
    router.get('/export', this.controller.exportCsv);
    router.post('/', this.controller.create);
    router.delete('/:id', this.controller.remove);

    return router;
  }
}
