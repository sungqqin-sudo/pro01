import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const BuyerDashboardPage = () => {
  const { db, currentUser, deleteMyAccount } = useApp();
  const navigate = useNavigate();

  const quotes = db.quotes
    .filter((q) => q.buyerUserId === currentUser?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const withdraw = () => {
    if (!window.confirm('정말 계정을 탈퇴하시겠습니까?')) return;
    const err = deleteMyAccount();
    if (!err) navigate('/');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">내 견적</h1>
      <p className="text-sm text-slate-600">현재 역할: {currentUser?.role}</p>

      <div className="space-y-3">
        {quotes.map((quote) => (
          <article key={quote.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">{new Date(quote.createdAt).toLocaleString('ko-KR')}</p>
              <Link
                to={`/buyer/quote?edit=${quote.id}`}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
              >
                수정
              </Link>
            </div>
            <ul className="mt-2 space-y-2">
              {quote.items.map((item, idx) => (
                <li key={`${quote.id}-${idx}`} className="text-sm text-slate-700">
                  {item.productName} / {item.qty}개 / {item.spec || '-'}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <button onClick={withdraw} className="rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700">계정 탈퇴</button>
    </div>
  );
};
