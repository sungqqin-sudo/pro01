import { createContext, useContext, useMemo, useState } from 'react';
import type { AppDB, Product, Quote, QuoteItem, Review, User, UserRole, Vendor } from '../types';
import {
  hashPassword,
  initStorage,
  loadDB,
  recalcVendorStats,
  saveDB,
  setSessionUserId,
  getSessionUserId,
  uid,
} from '../services/storage';

type SignupInput = {
  email: string;
  password: string;
  role: UserRole;
  companyName?: string;
  categories?: string[];
  phone?: string;
  contactEmail?: string;
  kakao?: string;
  contactPublic?: boolean;
};

type AppContextValue = {
  db: AppDB;
  currentUser: User | null;
  currentVendor: Vendor | null;
  isBuyer: boolean;
  isSeller: boolean;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  signup: (input: SignupInput) => string | null;
  updateVendorProfile: (patch: Partial<Vendor>) => void;
  createProduct: (input: Omit<Product, 'id' | 'vendorId' | 'keywords'>) => void;
  updateProduct: (productId: string, patch: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  addReview: (vendorId: string, rating: number, text: string) => string | null;
  saveQuote: (items: QuoteItem[]) => string | null;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const getSessionUser = (db: AppDB): User | null => {
  const id = getSessionUserId();
  if (!id) return null;
  return db.users.find((u) => u.id === id) ?? null;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  initStorage();
  const [db, setDb] = useState<AppDB>(() => loadDB());
  const [currentUser, setCurrentUser] = useState<User | null>(() => getSessionUser(loadDB()));

  const currentVendor = useMemo(() => {
    if (!currentUser || currentUser.role !== 'seller') return null;
    return db.vendors.find((v) => v.ownerUserId === currentUser.id) ?? null;
  }, [db.vendors, currentUser]);

  const commitDB = (next: AppDB) => {
    setDb(next);
    saveDB(next);
  };

  const login = (email: string, password: string): string | null => {
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return '사용자를 찾을 수 없습니다.';
    if (user.passwordHash !== hashPassword(password)) return '비밀번호가 일치하지 않습니다.';
    setCurrentUser(user);
    setSessionUserId(user.id);
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    setSessionUserId(null);
  };

  const signup = (input: SignupInput): string | null => {
    if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      return '이미 사용 중인 이메일입니다.';
    }

    const newUser: User = {
      id: uid('user'),
      email: input.email.trim().toLowerCase(),
      passwordHash: hashPassword(input.password),
      role: input.role,
      createdAt: new Date().toISOString(),
    };

    let next: AppDB = { ...db, users: [...db.users, newUser] };
    if (input.role === 'seller') {
      const vendor: Vendor = {
        id: uid('vendor'),
        ownerUserId: newUser.id,
        companyName: input.companyName?.trim() || '신규 업체',
        categories: input.categories?.length ? input.categories : ['기타'],
        contact: {
          phone: input.phone?.trim(),
          email: input.contactEmail?.trim(),
          kakao: input.kakao?.trim(),
        },
        contactPublic: Boolean(input.contactPublic),
        avgRating: 0,
        reviewCount: 0,
      };
      next = { ...next, vendors: [...next.vendors, vendor] };
    }

    commitDB(next);
    setCurrentUser(newUser);
    setSessionUserId(newUser.id);
    return null;
  };

  const updateVendorProfile = (patch: Partial<Vendor>) => {
    if (!currentVendor) return;
    const next = {
      ...db,
      vendors: db.vendors.map((v) => (v.id === currentVendor.id ? { ...v, ...patch, id: currentVendor.id, ownerUserId: currentVendor.ownerUserId } : v)),
    };
    commitDB(next);
  };

  const createProduct = (input: Omit<Product, 'id' | 'vendorId' | 'keywords'>) => {
    if (!currentVendor) return;
    const baseKeywords = [input.name, input.desc, ...input.tags, input.category]
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const product: Product = {
      ...input,
      id: uid('product'),
      vendorId: currentVendor.id,
      keywords: [...new Set(baseKeywords)],
    };

    commitDB({ ...db, products: [...db.products, product] });
  };

  const updateProduct = (productId: string, patch: Partial<Product>) => {
    if (!currentVendor) return;
    const next = {
      ...db,
      products: db.products.map((p) => {
        if (p.id !== productId || p.vendorId !== currentVendor.id) return p;
        const merged = { ...p, ...patch };
        const keywords = [merged.name, merged.desc, ...(merged.tags ?? []), merged.category]
          .join(' ')
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean);
        return { ...merged, keywords: [...new Set(keywords)] };
      }),
    };
    commitDB(next);
  };

  const deleteProduct = (productId: string) => {
    if (!currentVendor) return;
    commitDB({ ...db, products: db.products.filter((p) => !(p.id === productId && p.vendorId === currentVendor.id)) });
  };

  const addReview = (vendorId: string, rating: number, text: string): string | null => {
    if (!currentUser || currentUser.role !== 'buyer') return '구매자 로그인 후 리뷰를 등록할 수 있습니다.';
    if (rating < 1 || rating > 5) return '별점은 1~5점만 가능합니다.';

    const review: Review = {
      id: uid('review'),
      vendorId,
      buyerUserId: currentUser.id,
      rating,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const withReview = { ...db, reviews: [...db.reviews, review] };
    const next = recalcVendorStats(withReview, vendorId);
    commitDB(next);
    return null;
  };

  const saveQuote = (items: QuoteItem[]): string | null => {
    if (!currentUser || currentUser.role !== 'buyer') return '견적 저장은 구매자 로그인 후 가능합니다.';
    const quote: Quote = {
      id: uid('quote'),
      buyerUserId: currentUser.id,
      items,
      createdAt: new Date().toISOString(),
    };
    commitDB({ ...db, quotes: [...db.quotes, quote] });
    return null;
  };

  const value: AppContextValue = {
    db,
    currentUser,
    currentVendor,
    isBuyer: currentUser?.role === 'buyer',
    isSeller: currentUser?.role === 'seller',
    login,
    logout,
    signup,
    updateVendorProfile,
    createProduct,
    updateProduct,
    deleteProduct,
    addReview,
    saveQuote,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
