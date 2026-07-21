import type { Request, Response } from 'express';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from '@/models/user.js';
import { paginationQuerySchema } from '@/models/pagination.js';
import { userService } from '@/services/user.service.js';

export const userController = {
  async list(req: Request, res: Response): Promise<void> {
    const query = paginationQuerySchema.parse(req.query);
    const result = await userService.list(query);
    res.json(result);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = userIdParamSchema.parse(req.params);
    const user = await userService.getById(id);
    res.json(user);
  },

  async create(req: Request, res: Response): Promise<void> {
    const body = createUserSchema.parse(req.body);
    const user = await userService.create(body);
    res.status(201).json(user);
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = userIdParamSchema.parse(req.params);
    const body = updateUserSchema.parse(req.body);
    const user = await userService.update(id, body);
    res.json(user);
  },

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = userIdParamSchema.parse(req.params);
    await userService.delete(id);
    res.status(204).end();
  },
};
