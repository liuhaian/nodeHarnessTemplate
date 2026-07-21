import { randomUUID } from 'node:crypto';
import type { CreateUserInput, UpdateUserInput, User } from '@/models/user.js';
import type { Paginated, PaginationQuery } from '@/models/pagination.js';

/**
 * In-memory user repository. Swap this for a DB-backed implementation
 * without touching the service layer.
 *
 * Cursor is the base64-encoded id of the last returned item.
 */
export class UserRepository {
  private readonly users = new Map<string, User>();
  private readonly emailIndex = new Map<string, string>();

  async create(input: CreateUserInput): Promise<User> {
    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      email: input.email.toLowerCase(),
      name: input.name,
      role: input.role,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(user.id, user);
    this.emailIndex.set(user.email, user.id);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findByIds(ids: readonly string[]): Promise<readonly User[]> {
    const out: User[] = [];
    for (const id of ids) {
      const u = this.users.get(id);
      if (u) {
        out.push(u);
      }
    }
    return out;
  }

  async findByEmail(email: string): Promise<User | null> {
    const id = this.emailIndex.get(email.toLowerCase());
    return id ? (this.users.get(id) ?? null) : null;
  }

  async list(query: PaginationQuery): Promise<Paginated<User>> {
    const sorted = [...this.users.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    let startIndex = 0;
    if (query.cursor) {
      const idx = sorted.findIndex((u) => u.id === query.cursor);
      startIndex = idx >= 0 ? idx + 1 : 0;
    }
    const slice = sorted.slice(startIndex, startIndex + query.limit);
    const nextCursor =
      startIndex + query.limit < sorted.length ? (slice[slice.length - 1]?.id ?? null) : null;
    return { items: slice, nextCursor };
  }

  async update(id: string, patch: UpdateUserInput): Promise<User | null> {
    const existing = this.users.get(id);
    if (!existing) {
      return null;
    }
    if (patch.email && patch.email.toLowerCase() !== existing.email) {
      this.emailIndex.delete(existing.email);
      this.emailIndex.set(patch.email.toLowerCase(), id);
    }
    const updated: User = {
      ...existing,
      ...(patch.email !== undefined ? { email: patch.email.toLowerCase() } : {}),
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.role !== undefined ? { role: patch.role } : {}),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const u = this.users.get(id);
    if (!u) {
      return false;
    }
    this.users.delete(id);
    this.emailIndex.delete(u.email);
    return true;
  }

  /** Test helper — do not use in production code. */
  _reset(): void {
    this.users.clear();
    this.emailIndex.clear();
  }
}

export const userRepository = new UserRepository();
