import { Router } from 'express';
import { userController } from '@/controllers/user.controller.js';
import { asyncHandler } from '@/middlewares/async-handler.js';

export function createUserRouter(): Router {
  const router = Router();

  router.get('/', asyncHandler(userController.list));
  router.get('/:id', asyncHandler(userController.getById));
  router.post('/', asyncHandler(userController.create));
  router.patch('/:id', asyncHandler(userController.update));
  router.delete('/:id', asyncHandler(userController.delete));

  return router;
}
