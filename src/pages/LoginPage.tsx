import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const LoginPage = () => {
  const { login, currentUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'admin') navigate('/master/dashboard');
    else if (currentUser.role === 'seller') navigate('/seller/dashboard');
    else navigate('/buyer/dashboard');
  }, [currentUser, navigate]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const error = login(email, password);
    if (error) {
      setMessage(error);
      return;
    }
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold">로그인</h1>
      <p className="mt-1 text-sm text-slate-600">데모 계정 예시: buyer@demo.com / 1234, master@demo.com / 1234</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block text-sm">
          이메일
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          비밀번호
          <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <button className="w-full rounded-md bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700" type="submit">로그인</button>
      </form>
      {message && <p className="mt-3 text-sm text-rose-600">{message}</p>}
    </div>
  );
};
