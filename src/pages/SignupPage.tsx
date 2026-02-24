import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../services/storage';

type SignupRole = 'buyer' | 'seller';

export const SignupPage = () => {
  const { signup } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<SignupRole>('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [categories, setCategories] = useState<string[]>(['기타']);
  const [phone, setPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [kakao, setKakao] = useState('');
  const [contactPublic, setContactPublic] = useState(true);
  const [message, setMessage] = useState('');

  const toggleCategory = (cat: string) => {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const error = signup({ email, password, role, companyName, categories, phone, contactEmail, kakao, contactPublic });
    if (error) {
      setMessage(error);
      return;
    }
    navigate(role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard');
  };

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold">회원가입</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block text-sm">
          역할
          <select value={role} onChange={(e) => setRole(e.target.value as SignupRole)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
            <option value="buyer">구매자</option>
            <option value="seller">판매자</option>
          </select>
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            이메일
            <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="block text-sm">
            비밀번호
            <input value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} type="password" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
        </div>

        {role === 'seller' && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <label className="block text-sm">
              회사명
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>

            <div className="text-sm">
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

            <div className="grid gap-3 md:grid-cols-3">
              <label className="block text-sm">
                전화
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
              <label className="block text-sm">
                이메일
                <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
              <label className="block text-sm">
                카카오
                <input value={kakao} onChange={(e) => setKakao(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
            </div>

            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={contactPublic} onChange={(e) => setContactPublic(e.target.checked)} />
              연락처 공개
            </label>
          </div>
        )}

        <button className="w-full rounded-md bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700" type="submit">회원가입</button>
      </form>
      {message && <p className="mt-3 text-sm text-rose-600">{message}</p>}
    </div>
  );
};
