import { createContext, useContext, useMemo, useState } from 'react';
import type { AppDB, Product, Quote, QuoteItem, Review, User, UserRole, Vendor } from '../types';
import {
  hashPassword,
  initStorage,
  isBlockedNow,
  loadDB,
  recalcAllVendorStats,
  recalcVendorStats,
  saveDB,
  setSessionUserId,
  getSessionUserId,
  uid,
} from '../services/storage';

type SignupInput = {
  email: string;
  password: string;
  role: Exclude<UserRole, 'admin'>;
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
  isAdmin: boolean;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  signup: (input: SignupInput) => string | null;
  updateVendorProfile: (patch: Partial<Vendor>) => void;
  createProduct: (input: Omit<Product, 'id' | 'vendorId' | 'keywords'>) => void;
  updateProduct: (productId: string, patch: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  addReview: (vendorId: string, rating: number, text: string) => string | null;
  saveQuote: (items: QuoteItem[]) => string | null;
  updateQuote: (quoteId: string, items: QuoteItem[]) => string | null;
  applyUserSanction: (userId: string, days: number | null) => string | null;
  clearUserSanction: (userId: string) => void;
  applyVendorSanction: (vendorId: string, days: number | null) => string | null;
  clearVendorSanction: (vendorId: string) => void;
  deleteUserByAdmin: (userId: string) => string | null;
  deleteMyAccount: () => string | null;
  isUserBlocked: (user: User | null) => boolean;
  isVendorBlocked: (vendor: Vendor | null) => boolean;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const getSessionUser = (db: AppDB): User | null => {
  const id = getSessionUserId();
  if (!id) return null;
  return db.users.find((u) => u.id === id) ?? null;
};

const accountNameFromEmail = (email: string): string => email.split('@')[0] || email;

const blockedUntilByDays = (days: number | null): string | undefined => {
  if (days === null) return undefined;
  const target = Date.now() + days * 24 * 60 * 60 * 1000;
  return new Date(target).toISOString();
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  initStorage();
  const [db, setDb] = useState<AppDB>(() => loadDB());
  const [currentUser, setCurrentUser] = useState<User | null>(() => getSessionUser(loadDB()));

  const currentVendor = useMemo(() => {
    if (!currentUser || currentUser.role !== 'seller') return null;
    return db.vendors.find((v) => v.ownerUserId === currentUser.id) ?? null;
  }, [db.vendors, currentUser]);

  const isUserBlocked = (user: User | null): boolean => (user ? isBlockedNow(user.status, user.blockedUntil) : false);
  const isVendorBlocked = (vendor: Vendor | null): boolean => (vendor ? isBlockedNow(vendor.status, vendor.blockedUntil) : false);

  const commitDB = (next: AppDB) => {
    setDb(next);
    saveDB(next);
  };

  const deleteUserCascade = (source: AppDB, userId: string): AppDB => {
    const myVendorId = source.vendors.find((vendor) => vendor.ownerUserId === userId)?.id;

    let next: AppDB = {
      ...source,
      users: source.users.filter((user) => user.id !== userId),
      quotes: source.quotes.filter((quote) => quote.buyerUserId !== userId),
      reviews: source.reviews.filter((review) => review.reviewerUserId !== userId && review.buyerUserId !== userId),
    };

    if (myVendorId) {
      next = {
        ...next,
        vendors: next.vendors.filter((vendor) => vendor.id !== myVendorId),
        products: next.products.filter((product) => product.vendorId !== myVendorId),
        reviews: next.reviews.filter((review) => review.vendorId !== myVendorId),
      };
    }

    return recalcAllVendorStats(next);
  };

  const login = (email: string, password: string): string | null => {
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return '사용자를 찾을 수 없습니다.';
    if (user.passwordHash !== hashPassword(password)) return '비밀번호가 일치하지 않습니다.';
    if (isUserBlocked(user)) return '제재된 계정입니다. 관리자에게 문의하세요.';

    if (user.role === 'seller') {
      const vendor = db.vendors.find((v) => v.ownerUserId === user.id) ?? null;
      if (isVendorBlocked(vendor)) return '현재 업체 계정이 제재 중입니다. 일정 기간 이용할 수 없습니다.';
    }

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
      accountName: accountNameFromEmail(input.email.trim().toLowerCase()),
      passwordHash: hashPassword(input.password),
      role: input.role,
      status: 'active',
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
        status: 'active',
        isSample: false,
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
      vendors: db.vendors.map((v) =>
        v.id === currentVendor.id
          ? { ...v, ...patch, id: currentVendor.id, ownerUserId: currentVendor.ownerUserId, isSample: v.isSample }
          : v
      ),
    };
    commitDB(next);
  };

  const createProduct = (input: Omit<Product, 'id' | 'vendorId' | 'keywords'>) => {
    if (!currentVendor) return;
    if (isVendorBlocked(currentVendor)) return;

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
    if (isVendorBlocked(currentVendor)) return;

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
    if (isVendorBlocked(currentVendor)) return;
    commitDB({ ...db, products: db.products.filter((p) => !(p.id === productId && p.vendorId === currentVendor.id)) });
  };

  const addReview = (vendorId: string, rating: number, text: string): string | null => {
    if (!currentUser) return '로그인 후 리뷰를 등록할 수 있습니다.';
    if (currentUser.role === 'admin') return '관리자 계정은 리뷰를 작성할 수 없습니다.';
    if (isUserBlocked(currentUser)) return '제재된 계정은 리뷰 작성이 불가합니다.';

    const vendor = db.vendors.find((v) => v.id === vendorId) ?? null;
    if (!vendor) return '업체를 찾을 수 없습니다.';
    if (isVendorBlocked(vendor)) return '제재 중인 업체에는 리뷰를 등록할 수 없습니다.';
    if (rating < 1 || rating > 5) return '별점은 1~5점만 가능합니다.';

    const myVendor = currentUser.role === 'seller' ? db.vendors.find((v) => v.ownerUserId === currentUser.id) : null;

    const review: Review = {
      id: uid('review'),
      vendorId,
      reviewerUserId: currentUser.id,
      reviewerRole: currentUser.role,
      reviewerAccountName: currentUser.accountName || currentUser.email,
      reviewerVendorName: myVendor?.companyName,
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
    if (!currentUser || (currentUser.role !== 'buyer' && currentUser.role !== 'seller')) {
      return '견적 저장은 로그인 후 가능합니다.';
    }
    if (isUserBlocked(currentUser)) return '제재된 계정은 견적 저장이 불가합니다.';

    const quote: Quote = {
      id: uid('quote'),
      buyerUserId: currentUser.id,
      items,
      createdAt: new Date().toISOString(),
    };
    commitDB({ ...db, quotes: [...db.quotes, quote] });
    return null;
  };

  const updateQuote = (quoteId: string, items: QuoteItem[]): string | null => {
    if (!currentUser || (currentUser.role !== 'buyer' && currentUser.role !== 'seller')) {
      return '견적 수정은 로그인 후 가능합니다.';
    }
    if (isUserBlocked(currentUser)) return '제재된 계정은 견적 수정이 불가합니다.';
    if (items.length === 0) return '최소 1개 이상의 견적 항목이 필요합니다.';

    const target = db.quotes.find((quote) => quote.id === quoteId);
    if (!target) return '수정할 견적을 찾을 수 없습니다.';
    if (target.buyerUserId !== currentUser.id) return '본인 견적만 수정할 수 있습니다.';

    const next = {
      ...db,
      quotes: db.quotes.map((quote) => (
        quote.id === quoteId
          ? { ...quote, items, createdAt: new Date().toISOString() }
          : quote
      )),
    };
    commitDB(next);
    return null;
  };

  const applyUserSanction = (userId: string, days: number | null): string | null => {
    if (!currentUser || currentUser.role !== 'admin') return '관리자만 제재할 수 있습니다.';
    const target = db.users.find((user) => user.id === userId);
    if (!target) return '사용자를 찾을 수 없습니다.';
    if (target.role === 'admin') return '관리자 계정은 제재할 수 없습니다.';

    const next = {
      ...db,
      users: db.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: 'blocked' as const,
              blockedUntil: blockedUntilByDays(days),
            }
          : user
      ),
    };
    commitDB(next);

    if (currentUser.id === userId) logout();
    return null;
  };

  const clearUserSanction = (userId: string) => {
    const next = {
      ...db,
      users: db.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: 'active' as const,
              blockedUntil: undefined,
            }
          : user
      ),
    };
    commitDB(next);
  };

  const applyVendorSanction = (vendorId: string, days: number | null): string | null => {
    if (!currentUser || currentUser.role !== 'admin') return '관리자만 제재할 수 있습니다.';

    const next = {
      ...db,
      vendors: db.vendors.map((vendor) =>
        vendor.id === vendorId
          ? {
              ...vendor,
              status: 'blocked' as const,
              blockedUntil: blockedUntilByDays(days),
            }
          : vendor
      ),
    };
    commitDB(next);

    if (currentVendor?.id === vendorId) logout();
    return null;
  };

  const clearVendorSanction = (vendorId: string) => {
    const next = {
      ...db,
      vendors: db.vendors.map((vendor) =>
        vendor.id === vendorId
          ? {
              ...vendor,
              status: 'active' as const,
              blockedUntil: undefined,
            }
          : vendor
      ),
    };
    commitDB(next);
  };

  const deleteUserByAdmin = (userId: string): string | null => {
    if (!currentUser || currentUser.role !== 'admin') return '관리자만 계정을 삭제할 수 있습니다.';
    const target = db.users.find((user) => user.id === userId);
    if (!target) return '사용자를 찾을 수 없습니다.';
    if (target.role === 'admin') return '마스터 계정은 삭제할 수 없습니다.';

    const next = deleteUserCascade(db, userId);
    commitDB(next);
    return null;
  };

  const deleteMyAccount = (): string | null => {
    if (!currentUser) return '로그인 상태가 아닙니다.';
    if (currentUser.role === 'admin') return '마스터 계정은 탈퇴할 수 없습니다.';
    const next = deleteUserCascade(db, currentUser.id);
    commitDB(next);
    logout();
    return null;
  };

  const value: AppContextValue = {
    db,
    currentUser,
    currentVendor,
    isBuyer: currentUser?.role === 'buyer',
    isSeller: currentUser?.role === 'seller',
    isAdmin: currentUser?.role === 'admin',
    login,
    logout,
    signup,
    updateVendorProfile,
    createProduct,
    updateProduct,
    deleteProduct,
    addReview,
    saveQuote,
    updateQuote,
    applyUserSanction,
    clearUserSanction,
    applyVendorSanction,
    clearVendorSanction,
    deleteUserByAdmin,
    deleteMyAccount,
    isUserBlocked,
    isVendorBlocked,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
