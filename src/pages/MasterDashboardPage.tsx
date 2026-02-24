import { useState } from 'react';
import { useApp } from '../context/AppContext';

const fmt = (value?: string): string => (value ? new Date(value).toLocaleString('ko-KR') : '무기한');

export const MasterDashboardPage = () => {
  const {
    db,
    applyUserSanction,
    clearUserSanction,
    applyVendorSanction,
    clearVendorSanction,
    isUserBlocked,
    isVendorBlocked,
  } = useApp();
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">마스터 대시보드</h1>
      <p className="text-sm text-slate-600">문제 업체/계정을 기간 제재 또는 해제할 수 있습니다.</p>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">업체 제재</h2>
        <ul className="mt-3 space-y-2">
          {db.vendors.map((vendor) => (
            <li key={vendor.id} className="rounded-md border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{vendor.companyName}</p>
                  <p className="text-xs text-slate-500">{isVendorBlocked(vendor) ? `제재중 (${fmt(vendor.blockedUntil)})` : '정상'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-md border border-slate-300 px-3 py-1 text-sm" onClick={() => setMessage(applyVendorSanction(vendor.id, 7) || '업체 7일 제재 적용')}>7일 제재</button>
                  <button className="rounded-md border border-slate-300 px-3 py-1 text-sm" onClick={() => setMessage(applyVendorSanction(vendor.id, 30) || '업체 30일 제재 적용')}>30일 제재</button>
                  <button className="rounded-md border border-rose-300 px-3 py-1 text-sm text-rose-700" onClick={() => setMessage(applyVendorSanction(vendor.id, null) || '업체 무기한 제재 적용')}>무기한</button>
                  <button className="rounded-md border border-emerald-300 px-3 py-1 text-sm text-emerald-700" onClick={() => { clearVendorSanction(vendor.id); setMessage('업체 제재 해제'); }}>해제</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">계정 제재 (구매자/판매자)</h2>
        <ul className="mt-3 space-y-2">
          {db.users.filter((user) => user.role !== 'admin').map((user) => (
            <li key={user.id} className="rounded-md border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{user.accountName} ({user.email})</p>
                  <p className="text-xs text-slate-500">역할: {user.role} / {isUserBlocked(user) ? `제재중 (${fmt(user.blockedUntil)})` : '정상'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-md border border-slate-300 px-3 py-1 text-sm" onClick={() => setMessage(applyUserSanction(user.id, 7) || '계정 7일 제재 적용')}>7일 제재</button>
                  <button className="rounded-md border border-slate-300 px-3 py-1 text-sm" onClick={() => setMessage(applyUserSanction(user.id, 30) || '계정 30일 제재 적용')}>30일 제재</button>
                  <button className="rounded-md border border-rose-300 px-3 py-1 text-sm text-rose-700" onClick={() => setMessage(applyUserSanction(user.id, null) || '계정 무기한 제재 적용')}>무기한</button>
                  <button className="rounded-md border border-emerald-300 px-3 py-1 text-sm text-emerald-700" onClick={() => { clearUserSanction(user.id); setMessage('계정 제재 해제'); }}>해제</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
};
