import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { useApp } from '../context/AppContext';
import { parseNaturalQuery } from '../services/nlq';
import { searchProducts } from '../services/search';

export const SearchPage = () => {
  const { db, isAdmin, isVendorBlocked } = useApp();
  const [params, setParams] = useSearchParams();

  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const vendorId = params.get('vendorId') ?? '';
  const minRating = Number(params.get('minRating') ?? '0');
  const useAi = params.get('ai') === '1';

  const visibleDb = useMemo(() => {
    if (isAdmin) return db;
    const vendorIds = new Set(db.vendors.filter((vendor) => !isVendorBlocked(vendor)).map((vendor) => vendor.id));
    return {
      ...db,
      vendors: db.vendors.filter((vendor) => vendorIds.has(vendor.id)),
      products: db.products.filter((product) => vendorIds.has(product.vendorId)),
      reviews: db.reviews.filter((review) => vendorIds.has(review.vendorId)),
    };
  }, [db, isAdmin, isVendorBlocked]);

  const nlq = useMemo(() => (useAi && q ? parseNaturalQuery(q) : undefined), [q, useAi]);

  const results = useMemo(
    () =>
      searchProducts(
        visibleDb,
        {
          q,
          category,
          vendorId,
          minRating: Number.isNaN(minRating) ? 0 : minRating,
        },
        nlq
      ),
    [visibleDb, q, category, vendorId, minRating, nlq]
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">검색 결과</h1>
      <SearchBar
        initialQuery={q}
        initialCategory={category}
        initialAi={useAi}
        onSubmit={(query, nextCategory, ai) => {
          const next = new URLSearchParams(params);
          if (query) next.set('q', query); else next.delete('q');
          if (nextCategory) next.set('category', nextCategory); else next.delete('category');
          if (ai) next.set('ai', '1'); else next.delete('ai');
          setParams(next);
        }}
      />

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3">
        <label className="text-sm">
          <div className="mb-1 text-slate-600">업체 필터</div>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={vendorId}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value) next.set('vendorId', e.target.value); else next.delete('vendorId');
              setParams(next);
            }}
          >
            <option value="">전체 업체</option>
            {visibleDb.vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>{vendor.companyName}</option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <div className="mb-1 text-slate-600">최소 별점</div>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={String(minRating)}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value === '0') next.delete('minRating'); else next.set('minRating', e.target.value);
              setParams(next);
            }}
          >
            <option value="0">전체</option>
            <option value="3">3점 이상</option>
            <option value="4">4점 이상</option>
            <option value="5">5점</option>
          </select>
        </label>

        <div className="text-sm text-slate-700">
          <div className="mb-1 font-medium">AI 분석 결과</div>
          {nlq ? (
            <div className="space-y-1">
              <p>키워드: {nlq.keywords.join(', ') || '-'}</p>
              <p>추론 분야: {nlq.categories.join(', ') || '-'}</p>
            </div>
          ) : (
            <p>일반 검색 모드</p>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-600">총 {results.length}개 결과</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map(({ product, vendor }) => (
          <ProductCard key={product.id} product={product} vendor={vendor} />
        ))}
      </div>
    </div>
  );
};
