export const ContactPage = () => {
  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">문의하기</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          서비스 오류, 업체 정보 수정, 광고/콘텐츠 정책 문의는 아래 채널로 보내주세요.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm leading-6 text-slate-700">
        <h2 className="text-lg font-semibold text-slate-900">연락 채널</h2>
        <p className="mt-2">
          이메일: <a className="text-brand-700 underline" href="mailto:contact@estimate-check.com">contact@estimate-check.com</a>
        </p>
        <p className="mt-1">응답 시간: 영업일 기준 2일 이내</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm leading-6 text-slate-700">
        <h2 className="text-lg font-semibold text-slate-900">문의 시 포함하면 좋은 정보</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>문제가 발생한 페이지 URL</li>
          <li>발생 시각과 사용 브라우저</li>
          <li>오류 메시지 또는 스크린샷</li>
        </ul>
      </section>
    </div>
  );
};
