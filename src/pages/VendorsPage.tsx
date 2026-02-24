import { useState } from 'react';
import { VendorCard } from '../components/VendorCard';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../services/storage';

export const VendorsPage = () => {
  const { db } = useApp();
  const [category, setCategory] = useState('');

  const vendors = db.vendors.filter((vendor) => (category ? vendor.categories.includes(category) : true));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">업체 목록</h1>
      <div className="max-w-xs rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm">
          <div className="mb-1 text-slate-600">분야 필터</div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2">
            <option value="">전체</option>
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>
    </div>
  );
};
