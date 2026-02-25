export const AboutPage = () => {
  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">서비스 소개</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          산업 자재견적은 산업 현장에서 필요한 자재를 더 빠르고 정확하게 비교할 수 있도록 돕는 정보형 플랫폼입니다.
          사용자는 카테고리, 가격, 납기, 거래 조건을 기준으로 공급업체를 확인하고 견적을 저장해 반복 구매 의사결정을
          체계화할 수 있습니다.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">우리가 제공하는 가치</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
          <li>실무자가 바로 비교할 수 있는 구조화된 제품/업체 정보</li>
          <li>업체 평점과 리뷰 기반의 실제 선택 참고 자료</li>
          <li>반복 구매를 위한 견적 저장 및 이력 확인 기능</li>
          <li>검색과 카테고리 탐색을 결합한 빠른 조달 탐색 경험</li>
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">정보 운영 원칙</h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          본 서비스는 사용자 편의성과 정보 정확성을 우선합니다. 과장된 표현, 중복 문서 생성, 의미 없는 키워드 반복을
          지양하며, 사용자가 필요한 정보를 빠르게 찾을 수 있도록 페이지 구조를 지속 개선합니다.
        </p>
      </section>
    </div>
  );
};
