export const StarRating = ({ value, count }: { value: number; count?: number }) => {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-amber-500">{'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}</span>
      <span className="text-slate-600">{value.toFixed(1)}{count !== undefined ? ` (${count})` : ''}</span>
    </div>
  );
};
