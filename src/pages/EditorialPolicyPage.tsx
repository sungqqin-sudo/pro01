export const EditorialPolicyPage = () => {
  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">콘텐츠 품질 원칙</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          본 사이트는 광고 수익보다 사용자에게 실질적으로 도움이 되는 정보를 우선합니다. 아래 기준을 통해 품질을
          관리합니다.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">품질 체크 항목</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
          <li>중복 또는 자동 생성에 가까운 저품질 문서 배포 금지</li>
          <li>핵심 정보(사양, 가격, 납기, 거래 조건) 우선 제공</li>
          <li>사용자 의사결정에 필요한 비교 기준을 명확히 제시</li>
          <li>오류 제보 수신 시 검토 후 수정 이력 반영</li>
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">광고 및 사용자 경험 정책</h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          페이지 읽기 흐름을 방해하거나 콘텐츠를 가리는 광고 배치를 지양합니다. 콘텐츠 접근성을 우선하며, 광고와
          편집 콘텐츠를 명확히 구분합니다.
        </p>
      </section>
    </div>
  );
};
