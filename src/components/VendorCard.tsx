import { Link } from 'react-router-dom';
import type { Vendor } from '../types';
import { maskContactValue } from '../services/storage';
import { StarRating } from './StarRating';

export const VendorCard = ({ vendor }: { vendor: Vendor }) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{vendor.companyName}</h3>
          <p className="mt-1 text-sm text-slate-600">분야: {vendor.categories.join(', ')}</p>
        </div>
        <StarRating value={vendor.avgRating} count={vendor.reviewCount} />
      </div>

      <div className="mt-3 text-sm text-slate-700">
        {vendor.contactPublic ? (
          <p>연락처: {vendor.contact.phone ?? '-'} / {vendor.contact.email ?? '-'}</p>
        ) : (
          <p>문의하기(연락처 비공개): {maskContactValue(vendor.contact.email)}</p>
        )}
      </div>

      <Link
        to={`/vendor/${vendor.id}`}
        className="mt-4 inline-flex rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        업체 상세 보기
      </Link>
    </article>
  );
};
