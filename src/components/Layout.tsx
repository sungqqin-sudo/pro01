import { Link, NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`;

export const Layout = () => {
  const { currentUser, logout } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="text-xl font-bold text-brand-700">견적확인 사이트</Link>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/" className={navClass}>홈</NavLink>
            <NavLink to="/search" className={navClass}>검색</NavLink>
            <NavLink to="/vendors" className={navClass}>업체</NavLink>
            <NavLink to="/about" className={navClass}>서비스 소개</NavLink>
            <NavLink to="/buyer/quote" className={navClass}>견적 산출</NavLink>
            {(currentUser?.role === 'buyer' || currentUser?.role === 'seller') && <NavLink to="/buyer/dashboard" className={navClass}>내 견적</NavLink>}
            {currentUser?.role === 'seller' && <NavLink to="/seller/dashboard" className={navClass}>판매자 대시보드</NavLink>}
            {currentUser?.role === 'admin' && <NavLink to="/master/dashboard" className={navClass}>마스터 대시보드</NavLink>}
            {!currentUser && <NavLink to="/login" className={navClass}>로그인</NavLink>}
            {!currentUser && <NavLink to="/signup" className={navClass}>회원가입</NavLink>}
            {currentUser && (
              <button onClick={logout} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                로그아웃
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>© 2026 산업 자재견적. 사용자에게 유용한 비교 정보를 제공합니다.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/contact" className="hover:text-brand-700 hover:underline">문의</Link>
            <Link to="/editorial-policy" className="hover:text-brand-700 hover:underline">콘텐츠 원칙</Link>
            <Link to="/privacy" className="hover:text-brand-700 hover:underline">개인정보처리방침</Link>
            <Link to="/terms" className="hover:text-brand-700 hover:underline">이용약관</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
