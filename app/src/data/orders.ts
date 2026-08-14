export type OrderStatus = 'NEW' | 'PICKING' | 'SHIPPED' | 'CANCELLED';

export interface Order {
  id: string; // order number, e.g. ORD-00001
  customer: string;
  status: OrderStatus;
  total: number;
  date: string; // ISO date, within the last 365 days
  address: string;
}

export const STATUSES: OrderStatus[] = ['NEW', 'PICKING', 'SHIPPED', 'CANCELLED'];

// Seeded PRNG so the dataset is identical on every load (reproducible evidence).
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(0x5eed2026);

const FIRST = ['Ada', 'Ben', 'Chi', 'Dara', 'Efe', 'Femi', 'Grace', 'Hauwa', 'Ije', 'Jide', 'Kemi', 'Lola', 'Musa', 'Ngozi', 'Obi', 'Pius', 'Ruth', 'Sade', 'Tobi', 'Uche', 'Vera', 'Wale', 'Yemi', 'Zainab'];
const LAST = ['Adams', 'Bello', 'Cole', 'Diallo', 'Eze', 'Fadipe', 'Gbadamosi', 'Hassan', 'Ibrahim', 'Johnson', 'Kalu', 'Lawal', 'Mensah', 'Nnamdi', 'Okafor', 'Peters', 'Quadri', 'Raji', 'Sowande', 'Tunde', 'Umar', 'Vincent', 'Williams', 'Yakubu', 'Zubair'];
const STREETS = ['Market Rd', 'Station Ave', 'Grove St', 'King St', 'Mill Ln', 'Park Way', 'Hill Rise', 'Church Rd', 'Factory Ct', 'Harbour Rd', 'Oak Ave', 'River Dr', 'Victoria St', 'Elm Close', 'Meadow Walk'];
const CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu', 'Kaduna', 'Jos', 'Benin City', 'Calabar'];

const STATUS_WEIGHTS: Array<[OrderStatus, number]> = [
  ['NEW', 0.3],
  ['PICKING', 0.2],
  ['SHIPPED', 0.35],
  ['CANCELLED', 0.15],
];

function pickStatus(): OrderStatus {
  const r = rand();
  let acc = 0;
  for (const [s, w] of STATUS_WEIGHTS) {
    acc += w;
    if (r < acc) return s;
  }
  return 'SHIPPED';
}

// Fixed anchor (2026-08-13) so dates are always in the past and deterministic.
const ANCHOR = Date.UTC(2026, 8, 13);
const DAY = 86_400_000;

export const ORDERS: Order[] = Array.from({ length: 5000 }, (_, i) => {
  const n = i + 1;
  const day = Math.floor(rand() * 365);
  return {
    id: `ORD-${String(n).padStart(5, '0')}`,
    customer: `${FIRST[Math.floor(rand() * FIRST.length)]} ${LAST[Math.floor(rand() * LAST.length)]}`,
    status: pickStatus(),
    total: Math.round(rand() * 45_000 + 500) / 100,
    date: new Date(ANCHOR - day * DAY).toISOString().slice(0, 10),
    address: `${Math.floor(rand() * 899 + 100)} ${STREETS[Math.floor(rand() * STREETS.length)]}, ${CITIES[Math.floor(rand() * CITIES.length)]}`,
  };
});
