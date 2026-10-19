import { Router } from 'express';

export default class GoalRoutes {
  constructor(controller, authenticationMiddleware) {
    this.controller = controller;
    this.authenticationMiddleware = authenticationMiddleware;
  }

  createRouter() {
    const router = Router();

    router.use(this.authenticationMiddleware.protect);
    router.get('/', this.controller.list);
    router.post('/', this.controller.create);
    router.put('/:id', this.controller.update);
    router.delete('/:id', this.controller.remove);

    return router;
  }
}
