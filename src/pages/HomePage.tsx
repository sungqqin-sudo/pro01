import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { VendorCard } from '../components/VendorCard';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../services/storage';

export const HomePage = () => {
  const { db, isAdmin, isVendorBlocked } = useApp();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('');

  const visibleVendors = useMemo(
    () => (isAdmin ? db.vendors : db.vendors.filter((vendor) => !isVendorBlocked(vendor))),
    [db.vendors, isAdmin, isVendorBlocked]
  );

  const topVendors = useMemo(() => [...visibleVendors].sort((a, b) => b.avgRating - a.avgRating).slice(0, 3), [visibleVendors]);

  const topProducts = useMemo(() => {
    const allowedVendorIds = new Set(visibleVendors.map((v) => v.id));
    const source = activeCategory
      ? db.products.filter((p) => p.category === activeCategory && allowedVendorIds.has(p.vendorId))
      : db.products.filter((p) => allowedVendorIds.has(p.vendorId));
    return source.slice(0, 6);
  }, [db.products, activeCategory, visibleVendors]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-600 p-6 text-white">
        <h1 className="text-3xl font-bold">산업 자재견적</h1>
        <p className="mt-2 text-sm text-blue-100">필요한 산업 자재를 빠르게 찾고 업체 비교 후 견적까지 한 번에 진행하는 서비스입니다.</p>
        <div className="mt-4">
          <SearchBar
            onSubmit={(query, category, useAi) => {
              const params = new URLSearchParams();
              if (query) params.set('q', query);
              if (category) params.set('category', category);
              if (useAi) params.set('ai', '1');
              navigate(`/search?${params.toString()}`);
            }}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">분야 빠른 탭</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('')}
            className={`rounded-full px-4 py-2 text-sm ${activeCategory === '' ? 'bg-brand-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
          >
            전체
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm ${activeCategory === cat ? 'bg-brand-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">추천 업체</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {topVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">추천 제품</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topProducts.map((product) => {
            const vendor = db.vendors.find((v) => v.id === product.vendorId);
            if (!vendor) return null;
            return <ProductCard key={product.id} product={product} vendor={vendor} />;
          })}
        </div>
      </section>
    </div>
  );
};
