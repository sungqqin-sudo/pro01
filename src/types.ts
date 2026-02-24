export type UserRole = 'buyer' | 'seller';

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
};

export type VendorContact = {
  phone?: string;
  email?: string;
  kakao?: string;
};

export type Vendor = {
  id: string;
  ownerUserId: string;
  companyName: string;
  categories: string[];
  contact: VendorContact;
  contactPublic: boolean;
  avgRating: number;
  reviewCount: number;
};

export type Product = {
  id: string;
  vendorId: string;
  name: string;
  category: string;
  tags: string[];
  desc: string;
  priceMin?: number;
  priceMax?: number;
  keywords: string[];
};

export type Review = {
  id: string;
  vendorId: string;
  buyerUserId: string;
  rating: number;
  text: string;
  createdAt: string;
};

export type QuoteItem = {
  productId?: string;
  productName: string;
  category: string;
  qty: number;
  spec: string;
  memo: string;
  unitPriceMin?: number;
  unitPriceMax?: number;
};

export type Quote = {
  id: string;
  buyerUserId?: string;
  items: QuoteItem[];
  createdAt: string;
};

export type AppDB = {
  users: User[];
  vendors: Vendor[];
  products: Product[];
  reviews: Review[];
  quotes: Quote[];
};

export type SearchParams = {
  q: string;
  category: string;
  vendorId: string;
  minRating: number;
};
