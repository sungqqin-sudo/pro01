export const PrivacyPage = () => {
  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">개인정보처리방침</h1>
        <p className="mt-2 text-xs text-slate-500">최종 업데이트: 2026-02-25</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm leading-6 text-slate-700">
        <h2 className="text-lg font-semibold text-slate-900">1. 수집 항목</h2>
        <p className="mt-2">
          회원 가입 및 서비스 이용 과정에서 이메일, 계정명, 서비스 이용 기록(견적 저장 내역 등)이 수집될 수 있습니다.
        </p>

        <h2 className="mt-5 text-lg font-semibold text-slate-900">2. 이용 목적</h2>
        <p className="mt-2">
          계정 인증, 견적 저장/조회, 사용자 문의 대응, 서비스 안정성 개선을 위해 개인정보를 처리합니다.
        </p>

        <h2 className="mt-5 text-lg font-semibold text-slate-900">3. 보관 및 파기</h2>
        <p className="mt-2">
          관련 법령 또는 서비스 운영 목적 달성 시점까지 정보를 보관하며, 보관 목적이 종료되면 지체 없이 파기합니다.
        </p>

        <h2 className="mt-5 text-lg font-semibold text-slate-900">4. 제3자 제공</h2>
        <p className="mt-2">법령에 근거한 경우를 제외하고, 이용자 동의 없이 개인정보를 제3자에게 제공하지 않습니다.</p>

        <h2 className="mt-5 text-lg font-semibold text-slate-900">5. 문의</h2>
        <p className="mt-2">개인정보 관련 문의는 문의 페이지를 통해 접수할 수 있습니다.</p>
      </section>
    </div>
  );
};
