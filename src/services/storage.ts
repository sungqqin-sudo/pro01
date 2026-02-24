import seedRaw from '../data/seed.json';
import type { AppDB, User, Vendor } from '../types';

const DB_KEY = 'estimate_check_db_v1';
const SESSION_KEY = 'estimate_check_session_v1';

export const MASTER_EMAIL = 'master@demo.com';
export const MASTER_ACCOUNT_NAME = 'master';

const seedDB = seedRaw as unknown as AppDB;

const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const accountNameFromEmail = (email: string): string => email.split('@')[0] || email;

const normalizeUser = (user: User): User => ({
  ...user,
  accountName: user.accountName || accountNameFromEmail(user.email),
  status: user.status || 'active',
});

const normalizeVendor = (vendor: Vendor): Vendor => ({
  ...vendor,
  status: vendor.status || 'active',
  isSample: typeof vendor.isSample === 'boolean' ? vendor.isSample : vendor.id.startsWith('v-'),
});

const ensureMasterUser = (users: User[]): User[] => {
  if (users.some((user) => user.role === 'admin')) return users;
  return [
    ...users,
    {
      id: 'u-master-1',
      email: MASTER_EMAIL,
      accountName: MASTER_ACCOUNT_NAME,
      passwordHash: hashPassword('1234'),
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ];
};

const normalizeDB = (db: AppDB): AppDB => {
  const users = ensureMasterUser(db.users.map((user) => normalizeUser(user)));
  const vendors = db.vendors.map((vendor) => normalizeVendor(vendor));
  const reviews = db.reviews.map((review) => {
    if (review.reviewerUserId || !review.buyerUserId) return review;
    const writer = users.find((user) => user.id === review.buyerUserId);
    return {
      ...review,
      reviewerUserId: review.buyerUserId,
      reviewerRole: writer?.role || 'buyer',
      reviewerAccountName: writer?.accountName || writer?.email || 'unknown',
    };
  });

  return { ...db, users, vendors, reviews };
};

export const hashPassword = (plain: string): string => {
  let hash = 0;
  for (let i = 0; i < plain.length; i += 1) {
    hash = (hash * 31 + plain.charCodeAt(i)) >>> 0;
  }
  return `h$${hash}`;
};

export const uid = (prefix = 'id'): string => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const isBlockedNow = (status?: string, blockedUntil?: string): boolean => {
  if (status !== 'blocked') return false;
  if (!blockedUntil) return true;
  return new Date(blockedUntil).getTime() > Date.now();
};

export const initStorage = (): AppDB => {
  const existing = safeParse<AppDB | null>(localStorage.getItem(DB_KEY), null);
  if (existing) {
    const normalized = normalizeDB(existing);
    localStorage.setItem(DB_KEY, JSON.stringify(normalized));
    return normalized;
  }
  const normalizedSeed = normalizeDB(seedDB);
  localStorage.setItem(DB_KEY, JSON.stringify(normalizedSeed));
  return normalizedSeed;
};

export const loadDB = (): AppDB => {
  const initial = initStorage();
  return normalizeDB(safeParse<AppDB>(localStorage.getItem(DB_KEY), initial));
};

export const saveDB = (db: AppDB): void => {
  localStorage.setItem(DB_KEY, JSON.stringify(normalizeDB(db)));
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

export const recalcAllVendorStats = (db: AppDB): AppDB => {
  return db.vendors.reduce((acc, vendor) => recalcVendorStats(acc, vendor.id), db);
};

export const maskContactValue = (value?: string): string => {
  if (!value) return '-';
  if (value.length <= 4) return '****';
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
};

export const CATEGORIES = ['기계', '전기', '건축', '공구', '계장', '기타'];
