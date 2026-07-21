import { message, notification } from 'antd';
import { ApiError } from '@/api/http';

/**
 * Centralized API error handler.
 * - `message` for transient/expected errors.
 * - `notification` for anything the user should read carefully.
 * Never leak stack traces to the UI.
 */
export function handleApiError(err: unknown, fallback = 'Something went wrong'): void {
  if (err instanceof ApiError) {
    if (err.status >= 500) {
      notification.error({
        message: 'Server error',
        description: `${err.message}${err.requestId ? ` (id: ${err.requestId})` : ''}`,
      });
      return;
    }
    void message.error(err.message);
    return;
  }
  if (err instanceof Error) {
    void message.error(err.message || fallback);
    return;
  }
  void message.error(fallback);
}
