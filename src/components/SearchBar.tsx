import { useState } from 'react';
import { CATEGORIES } from '../services/storage';

type Props = {
  initialQuery?: string;
  initialCategory?: string;
  initialAi?: boolean;
  onSubmit: (query: string, category: string, useAi: boolean) => void;
};

export const SearchBar = ({ initialQuery = '', initialCategory = '', initialAi = false, onSubmit }: Props) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [useAi, setUseAi] = useState(initialAi);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_180px_120px]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="예: 75kw 모터 인버터 업체 찾아줘"
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          <option value="">전체 분야</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          type="button"
          className="rounded-md bg-brand-600 px-3 py-2 font-semibold text-white hover:bg-brand-700"
          onClick={() => onSubmit(query, category, useAi)}
        >
          검색
        </button>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={useAi} onChange={(e) => setUseAi(e.target.checked)} />
        AI 검색(무료 대체, 룰 기반)
      </label>
    </div>
  );
};
