/** Returns today's date as YYYY-MM-DD. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Converts a pair of YYYY-MM-DD dates (inclusive "from", inclusive "to") into
 * ISO timestamp bounds usable with the ORDERS.created_at >= from AND < to
 * query pattern used across the reporting screens.
 */
export function toDateRangeBounds(from: string, to: string): {from: string; to: string} {
  return {
    from: new Date(`${from}T00:00:00`).toISOString(),
    to: new Date(new Date(`${to}T00:00:00`).getTime() + 86400000).toISOString(),
  };
}
