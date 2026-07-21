import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api';
import type { CreateUserPayload, ListUsersParams, UpdateUserPayload } from '../types';

const KEYS = {
  all: ['users'] as const,
  list: (params: ListUsersParams) => ['users', 'list', params] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
};

export function useUsersList(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => usersApi.list(params),
    staleTime: 30_000,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: id ? KEYS.detail(id) : ['users', 'detail', 'none'],
    queryFn: () => usersApi.getById(id as string),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData(KEYS.detail(updated.id), updated);
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
