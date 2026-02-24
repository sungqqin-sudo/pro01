import seedRaw from '../data/seed.json';
import type { AppDB } from '../types';

const DB_KEY = 'estimate_check_db_v1';
const SESSION_KEY = 'estimate_check_session_v1';

const seedDB = seedRaw as AppDB;

const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const hashPassword = (plain: string): string => {
  let hash = 0;
  for (let i = 0; i < plain.length; i += 1) {
    hash = (hash * 31 + plain.charCodeAt(i)) >>> 0;
  }
  return `h$${hash}`;
};

export const uid = (prefix = 'id'): string => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const initStorage = (): AppDB => {
  const existing = safeParse<AppDB | null>(localStorage.getItem(DB_KEY), null);
  if (existing) return existing;
  localStorage.setItem(DB_KEY, JSON.stringify(seedDB));
  return seedDB;
};

export const loadDB = (): AppDB => {
  const initial = initStorage();
  return safeParse<AppDB>(localStorage.getItem(DB_KEY), initial);
};

export const saveDB = (db: AppDB): void => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const getSessionUserId = (): string | null => localStorage.getItem(SESSION_KEY);

export const setSessionUserId = (userId: string | null): void => {
  if (!userId) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, userId);
};

export const recalcVendorStats = (db: AppDB, vendorId: string): AppDB => {
  const vendorReviews = db.reviews.filter((r) => r.vendorId === vendorId);
  const reviewCount = vendorReviews.length;
  const avgRating = reviewCount
    ? Math.round((vendorReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
    : 0;

  return {
    ...db,
    vendors: db.vendors.map((vendor) => (vendor.id === vendorId ? { ...vendor, avgRating, reviewCount } : vendor)),
  };
};

export const maskContactValue = (value?: string): string => {
  if (!value) return '-';
  if (value.length <= 4) return '****';
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
};

export const CATEGORIES = ['기계', '전기', '건축', '공구', '계장', '기타'];
