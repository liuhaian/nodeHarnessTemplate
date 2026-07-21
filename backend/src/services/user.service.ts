import { LRUCache } from 'lru-cache';
import { CACHE_TTL_MS } from '@/config/constants.js';
import { ConflictError, NotFoundError } from '@/errors/app-error.js';
import type { CreateUserInput, UpdateUserInput, User } from '@/models/user.js';
import type { Paginated, PaginationQuery } from '@/models/pagination.js';
import { userRepository } from '@/repositories/user.repository.js';
import type { UserRepository } from '@/repositories/user.repository.js';

export class UserService {
  private readonly cache: LRUCache<string, User>;

  constructor(private readonly repo: UserRepository) {
    this.cache = new LRUCache({ max: 500, ttl: CACHE_TTL_MS.SHORT });
  }

  async create(input: CreateUserInput): Promise<User> {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email already in use', { details: { field: 'email' } });
    }
    const user = await this.repo.create(input);
    this.cache.set(user.id, user);
    return user;
  }

  async getById(id: string): Promise<User> {
    const cached = this.cache.get(id);
    if (cached) {
      return cached;
    }
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError('User not found', { details: { userId: id } });
    }
    this.cache.set(id, user);
    return user;
  }

  async list(query: PaginationQuery): Promise<Paginated<User>> {
    return this.repo.list(query);
  }

  async update(id: string, patch: UpdateUserInput): Promise<User> {
    if (patch.email) {
      const other = await this.repo.findByEmail(patch.email);
      if (other && other.id !== id) {
        throw new ConflictError('Email already in use', { details: { field: 'email' } });
      }
    }
    const updated = await this.repo.update(id, patch);
    if (!updated) {
      throw new NotFoundError('User not found', { details: { userId: id } });
    }
    this.cache.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const removed = await this.repo.delete(id);
    if (!removed) {
      throw new NotFoundError('User not found', { details: { userId: id } });
    }
    this.cache.delete(id);
  }
}

export const userService = new UserService(userRepository);
