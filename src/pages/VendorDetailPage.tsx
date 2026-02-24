import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { StarRating } from '../components/StarRating';
import { useApp } from '../context/AppContext';
import { maskContactValue } from '../services/storage';

export const VendorDetailPage = () => {
  const { id } = useParams();
  const { db, addReview, isBuyer, currentUser } = useApp();
  const vendor = db.vendors.find((v) => v.id === id);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');

  if (!vendor) return <p>업체를 찾을 수 없습니다.</p>;

  const products = db.products.filter((p) => p.vendorId === vendor.id);
  const reviews = db.reviews.filter((r) => r.vendorId === vendor.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const submitReview = (event: FormEvent) => {
    event.preventDefault();
    const err = addReview(vendor.id, rating, text);
    if (err) {
      setMessage(err);
      return;
    }
    setText('');
    setRating(5);
    setMessage('리뷰가 등록되었습니다.');
  };

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h1 className="text-2xl font-bold">{vendor.companyName}</h1>
        <p className="mt-1 text-sm text-slate-600">분야: {vendor.categories.join(', ')}</p>
        <div className="mt-2">
          <StarRating value={vendor.avgRating} count={vendor.reviewCount} />
        </div>
        <div className="mt-4 text-sm">
          {vendor.contactPublic ? (
            <div className="space-y-1 text-slate-700">
              <p>전화: {vendor.contact.phone ?? '-'}</p>
              <p>이메일: {vendor.contact.email ?? '-'}</p>
              <p>카카오: {vendor.contact.kakao ?? '-'}</p>
            </div>
          ) : (
            <div className="rounded-md bg-amber-50 p-3 text-amber-800">
              문의하기(연락처 비공개): {maskContactValue(vendor.contact.phone)} / {maskContactValue(vendor.contact.email)}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">제품 리스트</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} vendor={vendor} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">리뷰</h2>
          <ul className="mt-3 space-y-3">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-md border border-slate-200 p-3">
                <p className="text-amber-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                <p className="mt-1 text-sm text-slate-700">{review.text || '(코멘트 없음)'}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(review.createdAt).toLocaleString('ko-KR')}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">별점 남기기</h2>
          {isBuyer ? (
            <form onSubmit={submitReview}>
              <label className="mt-3 block text-sm">
                별점
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                >
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}점</option>)}
                </select>
              </label>
              <label className="mt-3 block text-sm">
                리뷰
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="mt-1 h-28 w-full rounded-md border border-slate-300 px-3 py-2"
                  placeholder="업체 후기를 입력하세요"
                />
              </label>
              <button className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white" type="submit">
                리뷰 등록
              </button>
              {message && <p className="mt-2 text-sm text-slate-700">{message}</p>}
            </form>
          ) : (
            <div className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              <p>리뷰/별점은 구매자 계정으로 로그인해야 등록할 수 있습니다.</p>
              <p className="mt-1">데모 구매자 계정: buyer@demo.com / 1234</p>
              <Link to="/login" className="mt-2 inline-block font-semibold underline">로그인 하러 가기</Link>
              {currentUser?.role === 'seller' && <p className="mt-1">현재 판매자로 로그인되어 있습니다. 로그아웃 후 구매자로 로그인해 주세요.</p>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
