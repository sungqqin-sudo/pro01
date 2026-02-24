import { useMemo, useState } from 'react';
import { VendorCard } from '../components/VendorCard';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../services/storage';

const PAGE_SIZE = 9;

export const VendorsPage = () => {
  const { db, isAdmin, isVendorBlocked } = useApp();
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const rows = db.vendors.filter((vendor) => (category ? vendor.categories.includes(category) : true));
    return isAdmin ? rows : rows.filter((vendor) => !isVendorBlocked(vendor));
  }, [db.vendors, category, isAdmin, isVendorBlocked]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedVendors = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">업체 목록</h1>
      <div className="max-w-xs rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm">
          <div className="mb-1 text-slate-600">분야 필터</div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">전체</option>
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </label>
      </div>

      <p className="text-sm text-slate-600">총 {filtered.length}개 / {currentPage}페이지 (총 {pageCount}페이지)</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pagedVendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
          disabled={currentPage <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          이전
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            className={`rounded-md px-3 py-1 text-sm ${n === currentPage ? 'bg-brand-600 text-white' : 'border border-slate-300'}`}
            onClick={() => setPage(n)}
          >
            {n}
          </button>
        ))}
        <button
          className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
          disabled={currentPage >= pageCount}
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        >
          다음
        </button>
      </div>
    </div>
  );
};
