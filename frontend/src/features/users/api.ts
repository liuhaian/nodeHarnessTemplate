import { http } from '@/api/http';
import {
  paginatedUsersSchema,
  userSchema,
  type CreateUserPayload,
  type ListUsersParams,
  type PaginatedUsers,
  type UpdateUserPayload,
  type User,
} from './types';

export const usersApi = {
  async list(params: ListUsersParams = {}): Promise<PaginatedUsers> {
    const res = await http.get('/users', { params });
    return paginatedUsersSchema.parse(res.data);
  },

  async getById(id: string): Promise<User> {
    const res = await http.get(`/users/${id}`);
    return userSchema.parse(res.data);
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const res = await http.post('/users', payload);
    return userSchema.parse(res.data);
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const res = await http.patch(`/users/${id}`, payload);
    return userSchema.parse(res.data);
  },

  async delete(id: string): Promise<void> {
    await http.delete(`/users/${id}`);
  },
};
