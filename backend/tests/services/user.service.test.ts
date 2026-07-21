import { beforeEach, describe, expect, it } from 'vitest';
import { UserRepository } from '@/repositories/user.repository.js';
import { UserService } from '@/services/user.service.js';
import { ConflictError, NotFoundError } from '@/errors/app-error.js';

describe('UserService', () => {
  let repo: UserRepository;
  let service: UserService;

  beforeEach(() => {
    repo = new UserRepository();
    service = new UserService(repo);
  });

  it('creates a user with default role', async () => {
    const user = await service.create({
      email: 'Alice@Example.com',
      name: 'Alice',
      role: 'user',
    });
    expect(user.email).toBe('alice@example.com');
    expect(user.role).toBe('user');
    expect(user.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('rejects duplicate emails', async () => {
    await service.create({ email: 'a@b.com', name: 'A', role: 'user' });
    await expect(
      service.create({ email: 'a@b.com', name: 'A2', role: 'user' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('throws NotFoundError when getting missing user', async () => {
    await expect(service.getById('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('updates a user and returns the new record', async () => {
    const u = await service.create({ email: 'x@y.com', name: 'X', role: 'user' });
    const updated = await service.update(u.id, { name: 'Y' });
    expect(updated.name).toBe('Y');
    expect(updated.id).toBe(u.id);
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(u.updatedAt).getTime(),
    );
  });

  it('deletes a user', async () => {
    const u = await service.create({ email: 'x@y.com', name: 'X', role: 'user' });
    await service.delete(u.id);
    await expect(service.getById(u.id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('paginates the list', async () => {
    for (let i = 0; i < 5; i++) {
      await service.create({ email: `u${i}@x.com`, name: `U${i}`, role: 'user' });
    }
    const page1 = await service.list({ limit: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = await service.list({ limit: 2, cursor: page1.nextCursor ?? undefined });
    expect(page2.items).toHaveLength(2);
    expect(page2.items[0]?.id).not.toBe(page1.items[0]?.id);
  });
});
