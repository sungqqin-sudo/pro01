import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { QuoteItem } from '../types';

const money = (n: number) => n.toLocaleString('ko-KR');

const totals = (items: QuoteItem[]) => {
  const min = items.reduce((sum, item) => sum + item.qty * (item.unitPriceMin ?? 0), 0);
  const max = items.reduce((sum, item) => sum + item.qty * (item.unitPriceMax ?? item.unitPriceMin ?? 0), 0);
  return { min, max };
};

export const BuyerQuotePage = () => {
  const { db, currentUser, saveQuote } = useApp();
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('기계');
  const [qty, setQty] = useState(1);
  const [spec, setSpec] = useState('');
  const [memo, setMemo] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [message, setMessage] = useState('');

  const currentProduct = useMemo(() => db.products.find((p) => p.id === selectedProductId), [db.products, selectedProductId]);

  const addItem = (event: FormEvent) => {
    event.preventDefault();
    const item: QuoteItem = {
      productId: currentProduct?.id,
      productName: currentProduct?.name || productName,
      category: currentProduct?.category || category,
      qty,
      spec,
      memo,
      unitPriceMin: currentProduct?.priceMin ?? (priceMin ? Number(priceMin) : undefined),
      unitPriceMax: currentProduct?.priceMax ?? (priceMax ? Number(priceMax) : undefined),
    };

    if (!item.productName.trim()) {
      setMessage('품목명을 입력하세요.');
      return;
    }

    setItems((prev) => [...prev, item]);
    setSelectedProductId('');
    setProductName('');
    setSpec('');
    setMemo('');
    setPriceMin('');
    setPriceMax('');
    setQty(1);
    setMessage('품목이 추가되었습니다.');
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const save = () => {
    if (items.length === 0) {
      setMessage('저장할 견적 항목이 없습니다.');
      return;
    }

    if (currentUser?.role !== 'buyer') {
      setMessage('비로그인은 저장할 수 없습니다. 로그인 후 저장해 주세요.');
      return;
    }

    const err = saveQuote(items);
    if (err) {
      setMessage(err);
      return;
    }
    setItems([]);
    setMessage('견적이 저장되었습니다.');
  };

  const total = totals(items);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">견적 산출</h1>
      <p className="text-sm text-slate-600">비로그인도 견적 산출 가능. 저장은 구매자 로그인 필요.</p>

      <form onSubmit={addItem} className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            제품 선택(선택)
            <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
              <option value="">직접 입력</option>
              {db.products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            품목명
            <input value={currentProduct?.name ?? productName} onChange={(e) => setProductName(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>

          <label className="text-sm">
            분야
            <input value={currentProduct?.category ?? category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>

          <label className="text-sm">
            수량
            <input value={qty} min={1} onChange={(e) => setQty(Number(e.target.value))} type="number" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>

          <label className="text-sm">
            단가 최소(선택)
            <input value={currentProduct?.priceMin ?? priceMin} onChange={(e) => setPriceMin(e.target.value)} type="number" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>

          <label className="text-sm">
            단가 최대(선택)
            <input value={currentProduct?.priceMax ?? priceMax} onChange={(e) => setPriceMax(e.target.value)} type="number" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
        </div>

        <label className="mt-3 block text-sm">
          스펙
          <input value={spec} onChange={(e) => setSpec(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="mt-3 block text-sm">
          메모
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} className="mt-1 h-24 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <button type="submit" className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">항목 추가</button>
      </form>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">현재 견적</h2>
        <ul className="mt-3 space-y-2">
          {items.map((item, idx) => (
            <li key={`${item.productName}-${idx}`} className="rounded-md border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{item.productName} ({item.category})</p>
                  <p className="text-sm text-slate-600">수량 {item.qty} / 스펙: {item.spec || '-'}</p>
                  <p className="text-sm text-slate-600">단가: {item.unitPriceMin ? money(item.unitPriceMin) : '-'} ~ {item.unitPriceMax ? money(item.unitPriceMax) : '-'}</p>
                </div>
                <button onClick={() => removeItem(idx)} className="rounded-md border border-rose-300 px-3 py-1 text-sm text-rose-600">삭제</button>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm font-semibold text-slate-800">
          예상 합계: {money(total.min)}원{total.max !== total.min ? ` ~ ${money(total.max)}원` : ''}
        </p>

        <button onClick={save} className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">견적 저장</button>
        {currentUser?.role !== 'buyer' && (
          <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            비로그인은 저장할 수 없습니다. <Link to="/login" className="font-semibold underline">로그인 후 저장</Link>
          </p>
        )}

        {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}
      </section>
    </div>
  );
};
