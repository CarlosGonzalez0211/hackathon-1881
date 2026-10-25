/** PostgREST returns at most 1000 rows per request; larger result sets must be paged. */
export const PAGE_SIZE = 1000;

type Page<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>;

/**
 * Reads every page of an ordered query. The query must have a stable order, otherwise rows
 * can repeat or go missing between pages.
 */
export async function fetchAll<T>(
  page: (from: number, to: number) => Page<T>,
  pageSize = PAGE_SIZE,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await page(from, from + pageSize - 1);
    if (error) throw new Error(`Supabase query failed: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) return rows;
  }
}
