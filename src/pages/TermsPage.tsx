export const TermsPage = () => {
  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">이용약관</h1>
        <p className="mt-2 text-xs text-slate-500">최종 업데이트: 2026-02-25</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm leading-6 text-slate-700">
        <h2 className="text-lg font-semibold text-slate-900">1. 서비스 목적</h2>
        <p className="mt-2">본 서비스는 산업 자재 정보 탐색 및 견적 비교를 위한 온라인 정보 제공 플랫폼입니다.</p>

        <h2 className="mt-5 text-lg font-semibold text-slate-900">2. 회원 의무</h2>
        <p className="mt-2">
          회원은 허위 정보를 입력하거나 서비스 운영을 방해하는 행위를 해서는 안 되며, 관련 법령을 준수해야 합니다.
        </p>

        <h2 className="mt-5 text-lg font-semibold text-slate-900">3. 콘텐츠와 책임 범위</h2>
        <p className="mt-2">
          서비스는 의사결정 지원을 위한 정보를 제공합니다. 실제 거래 조건, 납기, 가격은 업체 정책과 계약 조건에 따라
          달라질 수 있습니다.
        </p>

        <h2 className="mt-5 text-lg font-semibold text-slate-900">4. 서비스 변경</h2>
        <p className="mt-2">운영상 필요에 따라 기능, 화면, 제공 범위가 변경될 수 있으며 주요 변경은 공지합니다.</p>
      </section>
    </div>
  );
};
