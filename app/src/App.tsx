import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { ORDERS, STATUSES, type Order } from './data/orders';
import { useFilter, setQuery, toggleStatus, clearFilters } from './lib/filter';
import { countRender, isDebug } from './lib/renderCounts';
import './index.css';

const FilterBar = ({ count }: { count: number }) => {
  const { q, statuses } = useFilter();
  return (
    <header className="filterbar">
      <input type="search" value={q} placeholder="Search by order number…" aria-label="Search by order number" onChange={(e) => setQuery(e.target.value)} />
      <div className="statuses" role="group" aria-label="Filter by status">
        {STATUSES.map((s) => (
          <label key={s} className={statuses.includes(s) ? 'on' : ''}>
            <input type="checkbox" checked={statuses.includes(s)} onChange={() => toggleStatus(s)} />{s}
          </label>
        ))}
      </div>
      <button onClick={clearFilters}>Clear</button>
      <span className="count" aria-live="polite">{count.toLocaleString()} of {ORDERS.length.toLocaleString()} orders</span>
    </header>
  );
};

const OrderRow = memo(function OrderRow({ order, active, open, onOpen, register }: {
  order: Order;
  active: boolean;
  open: boolean;
  onOpen: (id: string) => void;
  register: (id: string, el: HTMLTableRowElement | null) => void;
}) {
  // Stable per-row callback: ref re-attachment happens only when the row itself re-renders.
  const ref = useCallback((el: HTMLTableRowElement | null) => register(order.id, el), [order.id, register]);
  return (
    <tr ref={ref} tabIndex={-1} data-order-id={order.id} className={active ? 'active' : open ? 'open' : ''} aria-selected={active} onClick={() => onOpen(order.id)}>
      <td className="num">{order.id}</td>
      <td>{order.customer}</td>
      <td><span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></td>
      <td className="num">{order.total.toFixed(2)}</td>
      <td>{order.date}</td>
      {isDebug && <td className="renders">{countRender(order.id)}</td>}
    </tr>
  );
});

const OrderList = memo(function OrderList({ rows, activeIndex, openId, rowRefs, onMove, onOpen, onClose }: {
  rows: Order[];
  activeIndex: number;
  openId: string | null;
  rowRefs: React.MutableRefObject<Map<string, HTMLTableRowElement | null>>;
  onMove: (i: number) => void;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const register = useCallback((id: string, el: HTMLTableRowElement | null) => {
    if (el) rowRefs.current.set(id, el);
    else rowRefs.current.delete(id);
  }, [rowRefs]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = e.key === 'ArrowDown' ? Math.min(activeIndex + 1, rows.length - 1) : Math.max(activeIndex - 1, 0);
      onMove(next);
      const el = rowRefs.current.get(rows[next].id);
      el?.focus();
      el?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      const row = rows[activeIndex];
      if (row) onOpen(row.id);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="list" role="grid" aria-label="Orders" tabIndex={0} onKeyDown={onKeyDown}>
      <table>
        <thead>
          <tr>
            <th scope="col" className="num">Order</th>
            <th scope="col">Customer</th>
            <th scope="col">Status</th>
            <th scope="col" className="num">Total</th>
            <th scope="col">Date</th>
            {isDebug && <th scope="col" className="renders">Renders</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((o, i) => (
            <OrderRow key={o.id} order={o} active={i === activeIndex} open={o.id === openId} onOpen={onOpen} register={register} />
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="empty">No orders match the current filters.</p>}
    </div>
  );
});

const OrderPanel = memo(function OrderPanel({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <aside className="panel" role="dialog" aria-label={`Order ${order.id} details`} tabIndex={-1}
      ref={(el) => { if (el && document.activeElement !== el) el.focus(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <h2>{order.id}</h2>
      <dl>
        <div><dt>Customer</dt><dd>{order.customer}</dd></div>
        <div><dt>Status</dt><dd>{order.status}</dd></div>
        <div><dt>Total</dt><dd>${order.total.toFixed(2)}</dd></div>
        <div><dt>Date</dt><dd>{order.date}</dd></div>
        <div><dt>Ship to</dt><dd>{order.address}</dd></div>
      </dl>
      <button onClick={onClose}>Close (Esc)</button>
    </aside>
  );
});

export default function App() {
  const filter = useFilter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeRaw, setActiveRaw] = useState(0);
  const rowRefs = useRef<Map<string, HTMLTableRowElement | null>>(new Map());
  const openIdRef = useRef<string | null>(null);

  const rows = useMemo(() => {
    const q = filter.q.trim().toLowerCase();
    return ORDERS.filter(
      (o) => (!q || o.id.toLowerCase().includes(q)) &&
        (filter.statuses.length === 0 || filter.statuses.includes(o.status)),
    );
  }, [filter]);

  const activeIndex = rows.length === 0 ? -1 : Math.min(activeRaw, rows.length - 1);
  const open = openId ? ORDERS.find((o) => o.id === openId) : undefined;

  // Stable callbacks: memoized rows must never see a new function identity.
  const openOrder = useCallback((id: string) => { openIdRef.current = id; setOpenId(id); }, []);
  const closePanel = useCallback(() => {
    const id = openIdRef.current;
    openIdRef.current = null;
    setOpenId(null);
    if (id) rowRefs.current.get(id)?.focus(); // Esc returns focus to the row that was open
  }, []);
  const move = useCallback((i: number) => setActiveRaw(i), []);

  return (
    <div className="app">
      <FilterBar count={rows.length} />
      <main className="content">
        <OrderList rows={rows} activeIndex={activeIndex} openId={openId} rowRefs={rowRefs} onMove={move} onOpen={openOrder} onClose={closePanel} />
        {open && <OrderPanel order={open} onClose={closePanel} />}
      </main>
    </div>
  );
}
