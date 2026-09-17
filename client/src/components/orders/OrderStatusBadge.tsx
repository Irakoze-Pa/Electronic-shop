export function OrderStatusBadge({ value }: { value: string }) {
  const color =
    value === "Delivered" || value === "Paid"
      ? "bg-emerald-100 text-emerald-700"
      : value === "Cancelled" || value === "Failed"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${color}`}
    >
      {value}
    </span>
  );
}
