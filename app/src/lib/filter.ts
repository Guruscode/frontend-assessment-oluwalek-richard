import { useSyncExternalStore } from 'react';
import type { OrderStatus } from '../data/orders';

export interface Filter { q: string; statuses: OrderStatus[]; }

const ALL: readonly OrderStatus[] = ['NEW', 'PICKING', 'SHIPPED', 'CANCELLED'];

function parse(search: string): Filter {
  const params = new URLSearchParams(search);
  const q = params.get('q') ?? '';
  const statuses = (params.get('status') ?? '').split(',').filter((s): s is OrderStatus => (ALL as readonly string[]).includes(s));
  return { q, statuses };
}

let filter: Filter = parse(window.location.search);
const listeners = new Set<() => void>();

function apply(next: Filter, mode: 'push' | 'replace') {
  filter = next;
  const params = new URLSearchParams();
  if (next.q) params.set('q', next.q);
  if (next.statuses.length > 0) params.set('status', next.statuses.join(','));
  const qs = params.toString();
  window.history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', qs ? `?${qs}` : window.location.pathname);
  listeners.forEach((l) => l());
}

// replaceState while typing (Back won't walk every keystroke); pushState for discrete changes.
export const setQuery = (q: string) => apply({ ...filter, q }, 'replace');
export const toggleStatus = (s: OrderStatus) => apply({
  ...filter,
  statuses: filter.statuses.includes(s) ? filter.statuses.filter((x) => x !== s) : [...filter.statuses, s],
}, 'push');
export const clearFilters = () => apply({ q: '', statuses: [] }, 'push');

// Back/forward button: re-read the URL. Registered once at module scope (no effect, no cleanup).
window.addEventListener('popstate', () => { filter = parse(window.location.search); listeners.forEach((l) => l()); });

export function useFilter(): Filter {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => filter,
  );
}
