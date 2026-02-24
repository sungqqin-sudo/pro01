import { Link } from 'react-router-dom';
import type { Product, Vendor } from '../types';

const formatPrice = (min?: number, max?: number): string => {
  if (min === undefined && max === undefined) return '가격 문의';
  if (max === undefined || min === max) return `${(min ?? max ?? 0).toLocaleString('ko-KR')}원`;
  return `${(min ?? 0).toLocaleString('ko-KR')}원 ~ ${(max ?? 0).toLocaleString('ko-KR')}원`;
};

export const ProductCard = ({ product, vendor }: { product: Product; vendor: Vendor }) => (
  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2">
      <p className="text-xs font-semibold text-brand-700">{product.category}</p>
      {vendor.isSample && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">예시 자재</span>}
    </div>
    <h3 className="mt-1 text-lg font-semibold text-slate-900">{product.name}</h3>
    <p className="mt-2 text-sm text-slate-600">{product.desc}</p>
    <p className="mt-2 text-sm font-medium text-slate-900">{formatPrice(product.priceMin, product.priceMax)}</p>
    <p className="mt-2 text-xs text-slate-500">태그: {product.tags.join(', ')}</p>
    <div className="mt-4 flex items-center justify-between gap-2">
      <span className="text-sm text-slate-700">
        업체: {vendor.companyName} {vendor.isSample ? '(예시 업체)' : ''}
      </span>
      <Link to={`/vendor/${vendor.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
        업체 보기
      </Link>
    </div>
  </article>
);
