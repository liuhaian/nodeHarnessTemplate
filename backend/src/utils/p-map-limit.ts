/**
 * Runs `mapper` over `items` with at most `limit` concurrent operations.
 * Preserves input order in output.
 *
 * Use this instead of `Promise.all(items.map(...))` when the operation hits
 * an external system (DB, HTTP) to avoid overwhelming it.
 */
export async function pMapLimit<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (limit <= 0) {
    throw new Error('pMapLimit: limit must be > 0');
  }

  const results: R[] = new Array(items.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      const item = items[index];
      if (item === undefined) {
        continue;
      }
      results[index] = await mapper(item, index);
    }
  });

  await Promise.all(workers);
  return results;
}
