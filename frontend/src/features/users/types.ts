import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'user']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: userRoleSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type User = z.infer<typeof userSchema>;

export const paginatedUsersSchema = z.object({
  items: z.array(userSchema),
  nextCursor: z.string().nullable(),
});
export type PaginatedUsers = z.infer<typeof paginatedUsersSchema>;

export interface ListUsersParams {
  readonly limit?: number;
  readonly cursor?: string;
}

export interface CreateUserPayload {
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
}

export interface UpdateUserPayload {
  readonly email?: string;
  readonly name?: string;
  readonly role?: UserRole;
}
