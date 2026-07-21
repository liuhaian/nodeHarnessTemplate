import axios, { AxiosError, type AxiosInstance } from 'axios';

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: Record<string, unknown>;
  };
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly requestId: string | undefined;
  readonly details: Record<string, unknown> | undefined;

  constructor(status: number, body: ApiErrorBody['error']) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.requestId = body.requestId;
    this.details = body.details;
  }
}

function createHttp(): AxiosInstance {
  const instance = axios.create({
    baseURL: '/api/v1',
    timeout: 15_000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.response.use(
    (res) => res,
    (err: unknown) => {
      if (err instanceof AxiosError && err.response) {
        const body = err.response.data as ApiErrorBody | undefined;
        if (body?.error) {
          return Promise.reject(new ApiError(err.response.status, body.error));
        }
        return Promise.reject(
          new ApiError(err.response.status, {
            code: 'UNKNOWN_ERROR',
            message: err.message,
          }),
        );
      }
      if (err instanceof AxiosError) {
        return Promise.reject(
          new ApiError(0, { code: 'NETWORK_ERROR', message: err.message }),
        );
      }
      return Promise.reject(err);
    },
  );

  return instance;
}

export const http = createHttp();
