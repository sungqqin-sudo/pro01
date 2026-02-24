import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { useApp } from '../context/AppContext';
import { parseNaturalQuery } from '../services/nlq';
import { searchProducts } from '../services/search';

const PAGE_SIZE = 9;
const PAGE_WINDOW = 5;

const buildPageItems = (current: number, total: number): Array<number | 'ellipsis'> => {
  if (total <= PAGE_WINDOW + 2) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: Array<number | 'ellipsis'> = [1];
  const half = Math.floor(PAGE_WINDOW / 2);
  let start = Math.max(2, current - half);
  let end = Math.min(total - 1, current + half);

  if (start === 2) end = Math.min(total - 1, start + PAGE_WINDOW - 1);
  if (end === total - 1) start = Math.max(2, end - PAGE_WINDOW + 1);

  if (start > 2) items.push('ellipsis');
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < total - 1) items.push('ellipsis');
  items.push(total);
  return items;
};

export const SearchPage = () => {
  const { db, isAdmin, isVendorBlocked } = useApp();
  const [params, setParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'product' | 'vendor'>('product');
  const resultsRef = useRef<HTMLDivElement>(null);

  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const vendorId = params.get('vendorId') ?? '';
  const minRating = Number(params.get('minRating') ?? '0');
  const useAi = params.get('ai') === '1';
  const requestedPage = Number(params.get('page') ?? '1');

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

  const groupedByVendor = useMemo(() => {
    const grouped = new Map<
      string,
      {
        vendor: (typeof results)[number]['vendor'];
        items: typeof results;
        bestScore: number;
      }
    >();

    results.forEach((item) => {
      const current = grouped.get(item.vendor.id);
      if (!current) {
        grouped.set(item.vendor.id, { vendor: item.vendor, items: [item], bestScore: item.score });
        return;
      }
      current.items.push(item);
      current.bestScore = Math.max(current.bestScore, item.score);
    });

    return Array.from(grouped.values()).sort((a, b) => {
      if (a.vendor.isSample !== b.vendor.isSample) return a.vendor.isSample ? 1 : -1;
      return b.bestScore - a.bestScore || b.vendor.avgRating - a.vendor.avgRating;
    });
  }, [results]);

  const pageCount = Math.max(1, Math.ceil((viewMode === 'product' ? results.length : groupedByVendor.length) / PAGE_SIZE));
  const currentPage = Number.isFinite(requestedPage) ? Math.max(1, Math.min(pageCount, requestedPage)) : 1;
  const pagedResults = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pagedVendorGroups = groupedByVendor.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageItems = buildPageItems(currentPage, pageCount);

  useEffect(() => {
    if (requestedPage !== currentPage) {
      const next = new URLSearchParams(params);
      if (currentPage === 1) next.delete('page'); else next.set('page', String(currentPage));
      setParams(next, { replace: true });
    }
  }, [currentPage, params, requestedPage, setParams]);

  const movePage = (nextPage: number) => {
    const safeNext = Math.max(1, Math.min(pageCount, nextPage));
    const next = new URLSearchParams(params);
    if (safeNext === 1) next.delete('page'); else next.set('page', String(safeNext));
    setParams(next);
    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

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
          next.delete('page');
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
              next.delete('page');
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
              next.delete('page');
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

      <div ref={resultsRef} className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {viewMode === 'product'
            ? `총 ${results.length}개 자재 결과 / ${currentPage}페이지 (총 ${pageCount}페이지)`
            : `총 ${groupedByVendor.length}개 업체 / 자재 ${results.length}건 / ${currentPage}페이지 (총 ${pageCount}페이지)`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`rounded-md px-3 py-1 text-sm ${viewMode === 'product' ? 'bg-brand-600 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            onClick={() => {
              setViewMode('product');
              movePage(1);
            }}
          >
            자재 기준
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1 text-sm ${viewMode === 'vendor' ? 'bg-brand-600 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            onClick={() => {
              setViewMode('vendor');
              movePage(1);
            }}
          >
            업체 기준
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            결과 위치 고정
          </button>
        </div>
      </div>

      {viewMode === 'product' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pagedResults.map(({ product, vendor }) => (
            <ProductCard key={product.id} product={product} vendor={vendor} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {pagedVendorGroups.map(({ vendor, items }) => (
            <section key={vendor.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{vendor.companyName}</h3>
                <p className="text-sm text-slate-600">매칭 자재 {items.length}개</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map(({ product }) => (
                  <ProductCard key={product.id} product={product} vendor={vendor} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
          disabled={currentPage <= 1}
          onClick={() => movePage(currentPage - 1)}
        >
          이전
        </button>
        {pageItems.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm text-slate-500">...</span>
          ) : (
            <button
              key={item}
              className={`rounded-md px-3 py-1 text-sm ${item === currentPage ? 'bg-brand-600 text-white' : 'border border-slate-300'}`}
              onClick={() => movePage(item)}
            >
              {item}
            </button>
          )
        )}
        <button
          className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
          disabled={currentPage >= pageCount}
          onClick={() => movePage(currentPage + 1)}
        >
          다음
        </button>
      </div>
    </div>
  );
};
