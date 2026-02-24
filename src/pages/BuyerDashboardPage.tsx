import { useApp } from '../context/AppContext';

export const BuyerDashboardPage = () => {
  const { db, currentUser } = useApp();
  const quotes = db.quotes
    .filter((q) => q.buyerUserId === currentUser?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">내 견적</h1>
      <div className="space-y-3">
        {quotes.map((quote) => (
          <article key={quote.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{new Date(quote.createdAt).toLocaleString('ko-KR')}</p>
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
    </div>
  );
};
