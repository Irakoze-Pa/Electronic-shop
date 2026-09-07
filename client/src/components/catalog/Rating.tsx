import { StarIcon } from "../ui/Icons";

export function Rating({ count, value }: { count?: number; value: number }) {
  return (
    <div
      className="flex items-center gap-2"
      aria-label={`${value} out of 5 stars`}
    >
      <span className="flex text-amber-400">
        {Array.from({ length: 5 }, (_, index) => (
          <StarIcon
            className={`size-3.5 ${index + 1 > Math.round(value) ? "text-slate-200" : ""}`}
            key={index}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-slate-500">
        {value}
        {count === undefined ? "" : ` (${count})`}
      </span>
    </div>
  );
}
