import { currencyFormatter } from "../../utils/format";

export function SalesBars({
  data,
}: {
  data: { date: string; sales: number }[];
}) {
  const max = Math.max(...data.map((item) => item.sales), 1);
  if (!data.length || data.every((item) => item.sales === 0))
    return (
      <p className="rounded-xl bg-slate-50 py-12 text-center text-sm text-slate-500">
        No delivered sales in this period.
      </p>
    );
  return (
    <>
      <div
        aria-hidden="true"
        className="flex h-52 items-end gap-2 overflow-x-auto border-b border-slate-100 pb-2 pt-5"
      >
        {data.map((item, index) => (
          <div
            className="group flex min-w-8 flex-1 flex-col items-center justify-end"
            key={item.date}
            title={`${item.date}: ${currencyFormatter.format(item.sales)}`}
          >
            <div
              className={`w-full max-w-10 rounded-t-md transition group-hover:bg-orange-500 ${item.sales === max ? "bg-orange-400" : "bg-slate-700"}`}
              style={{
                height: `${item.sales > 0 ? Math.max((item.sales / max) * 150, 2) : 0}px`,
              }}
            />
            <span
              className={`mt-3 text-[9px] text-slate-400 ${index === 0 || index === data.length - 1 ? "block" : "hidden sm:block"}`}
            >
              {item.date.slice(5)}
            </span>
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>Sales by order date</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Delivered sales</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.date}>
              <th scope="row">{item.date}</th>
              <td>{currencyFormatter.format(item.sales)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
