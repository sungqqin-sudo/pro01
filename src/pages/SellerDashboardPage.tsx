import { FormEvent, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../services/storage';

export const SellerDashboardPage = () => {
  const { db, currentVendor, updateVendorProfile, createProduct, updateProduct, deleteProduct } = useApp();
  const [message, setMessage] = useState('');

  const [companyName, setCompanyName] = useState(currentVendor?.companyName ?? '');
  const [categories, setCategories] = useState<string[]>(currentVendor?.categories ?? ['기타']);
  const [phone, setPhone] = useState(currentVendor?.contact.phone ?? '');
  const [email, setEmail] = useState(currentVendor?.contact.email ?? '');
  const [kakao, setKakao] = useState(currentVendor?.contact.kakao ?? '');
  const [contactPublic, setContactPublic] = useState(Boolean(currentVendor?.contactPublic));

  const [name, setName] = useState('');
  const [category, setCategory] = useState('기계');
  const [tags, setTags] = useState('');
  const [desc, setDesc] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const [editingId, setEditingId] = useState('');

  const myProducts = useMemo(() => {
    if (!currentVendor) return [];
    return db.products.filter((p) => p.vendorId === currentVendor.id);
  }, [db.products, currentVendor]);

  if (!currentVendor) return <p>판매자 업체 정보가 없습니다.</p>;

  const toggleCategory = (cat: string) => {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]));
  };

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    updateVendorProfile({
      companyName,
      categories: categories.length ? categories : ['기타'],
      contact: { phone, email, kakao },
      contactPublic,
    });
    setMessage('판매자 프로필이 저장되었습니다.');
  };

  const submitProduct = (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      name,
      category,
      tags: tags.split(',').map((v) => v.trim()).filter(Boolean),
      desc,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
    };

    if (editingId) {
      updateProduct(editingId, payload);
      setMessage('제품이 수정되었습니다.');
    } else {
      createProduct(payload);
      setMessage('제품이 등록되었습니다.');
    }

    setName('');
    setCategory('기계');
    setTags('');
    setDesc('');
    setPriceMin('');
    setPriceMax('');
    setEditingId('');
  };

  const startEdit = (productId: string) => {
    const target = myProducts.find((p) => p.id === productId);
    if (!target) return;
    setEditingId(target.id);
    setName(target.name);
    setCategory(target.category);
    setTags(target.tags.join(', '));
    setDesc(target.desc);
    setPriceMin(target.priceMin ? String(target.priceMin) : '');
    setPriceMax(target.priceMax ? String(target.priceMax) : '');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">판매자 대시보드</h1>

      <form onSubmit={saveProfile} className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">업체 프로필</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            회사명
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="inline-flex items-center gap-2 text-sm md:mt-7">
            <input type="checkbox" checked={contactPublic} onChange={(e) => setContactPublic(e.target.checked)} />
            연락처 공개
          </label>
        </div>

        <div className="mt-3 text-sm">
          <p className="mb-1">분야(복수 선택)</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs">
                <input type="checkbox" checked={categories.includes(cat)} onChange={() => toggleCategory(cat)} className="mr-1" />
                {cat}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="text-sm">전화<input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm">이메일<input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm">카카오<input value={kakao} onChange={(e) => setKakao(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        </div>

        <button className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700" type="submit">프로필 저장</button>
      </form>

      <form onSubmit={submitProduct} className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">제품 {editingId ? '수정' : '등록'}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-sm">제품명<input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm">
            분야
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </label>
          <label className="text-sm">태그(콤마 구분)<input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm">설명<input value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm">최소 단가<input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} type="number" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></label>
          <label className="text-sm">최대 단가<input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} type="number" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        </div>
        <button className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700" type="submit">
          {editingId ? '수정 저장' : '제품 추가'}
        </button>
      </form>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">내 제품 리스트</h2>
        <ul className="mt-3 space-y-2">
          {myProducts.map((product) => (
            <li key={product.id} className="rounded-md border border-slate-200 p-3">
              <p className="font-medium">{product.name} ({product.category})</p>
              <p className="text-sm text-slate-600">{product.desc}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => startEdit(product.id)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">수정</button>
                <button onClick={() => deleteProduct(product.id)} className="rounded-md border border-rose-300 px-3 py-1 text-sm text-rose-600">삭제</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
};
