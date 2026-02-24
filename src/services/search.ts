import type { AppDB, Product, SearchParams, Vendor } from '../types';
import type { NLQResult } from './nlq';

export type ProductResult = {
  product: Product;
  vendor: Vendor;
  score: number;
};

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^0-9a-zA-Z가-힣\s]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

const productTokens = (product: Product, vendor: Vendor): Set<string> => {
  const tokens = tokenize(
    `${product.name} ${product.desc} ${product.tags.join(' ')} ${product.keywords.join(' ')} ${vendor.companyName} ${vendor.categories.join(' ')}`
  );
  return new Set(tokens);
};

const vendorTokens = (vendor: Vendor): Set<string> => {
  const tokens = tokenize(`${vendor.companyName} ${vendor.categories.join(' ')}`);
  return new Set(tokens);
};

export const searchProducts = (db: AppDB, params: SearchParams, nlq?: NLQResult): ProductResult[] => {
  const queryTokens = tokenize(params.q);
  const vendorQueryTokens = tokenize(params.vendorQuery);
  const aiTokens = nlq?.keywords ?? [];
  const mergedProductTokens = [...new Set([...queryTokens, ...aiTokens])];

  return db.products
    .map((product) => {
      const vendor = db.vendors.find((v) => v.id === product.vendorId);
      if (!vendor) return null;
      if (params.category && !(product.category === params.category || vendor.categories.includes(params.category))) return null;
      if (nlq?.categories?.length && !nlq.categories.some((c) => vendor.categories.includes(c) || product.category === c)) return null;
      if (params.vendorId && vendor.id !== params.vendorId) return null;
      if (params.minRating > 0 && vendor.avgRating < params.minRating) return null;

      const productTokenSet = productTokens(product, vendor);
      const vendorTokenSet = vendorTokens(vendor);

      const productScore = mergedProductTokens.reduce((sum, token) => (productTokenSet.has(token) ? sum + 1 : sum), 0);
      const vendorScore = vendorQueryTokens.reduce((sum, token) => (vendorTokenSet.has(token) ? sum + 1 : sum), 0);
      const score = productScore + vendorScore;

      if (mergedProductTokens.length && productScore === 0) return null;
      if (vendorQueryTokens.length && vendorScore === 0) return null;
      return { product, vendor, score };
    })
    .filter((item): item is ProductResult => Boolean(item))
    .sort((a, b) => {
      if (a.vendor.isSample !== b.vendor.isSample) return a.vendor.isSample ? 1 : -1;
      return b.score - a.score || b.vendor.avgRating - a.vendor.avgRating;
    });
};
