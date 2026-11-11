import { formatQuantity } from "@/lib/format";
import type { Allocation } from "@/types";
import { Money, Percent, QuoteTags } from "./parts";

// Donut of what the account holds (slice size comes from weight_percent; numbers are used only to draw)
const COLORS = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--chart-6", "--chart-7", "--chart-8"];
const RADIUS = 15.9155;

function colorOf(index: number) {
  return `var(${COLORS[index % COLORS.length]})`;
}

function slices(rows: Allocation[]) {
  let offset = 0;
  return rows.map((row, index) => {
    const share = row.weight_percent === null ? 0 : Math.max(0, Number(row.weight_percent));
    const slice = { symbol: row.symbol, share, offset, color: colorOf(index) };
    offset += share;
    return slice;
  });
}

export function AllocationChart({ rows, canDraw }: { rows: Allocation[]; canDraw: boolean }) {
  const drawn = slices(rows);
  const summary = rows.map((row) => `${row.symbol} ${row.weight_percent ?? "ไม่มีข้อมูล"}%`).join(", ");

  return (
    <div className="grid gap-6 sm:grid-cols-[14rem_1fr] sm:items-center">
      {canDraw ? (
        <svg
          viewBox="0 0 42 42"
          role="img"
          aria-label={`สัดส่วนหุ้นที่ถือ: ${summary}`}
          className="mx-auto w-full max-w-56 -rotate-90"
        >
          <circle cx="21" cy="21" r={RADIUS} fill="none" stroke="var(--rule)" strokeWidth="6" />
          {drawn
            .filter((slice) => slice.share > 0)
            .map((slice) => (
              <circle
                key={slice.symbol}
                cx="21"
                cy="21"
                r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth="6"
                strokeDasharray={`${slice.share} ${100 - slice.share}`}
                strokeDashoffset={-slice.offset}
              />
            ))}
        </svg>
      ) : (
        <p className="rounded border border-dashed border-field-border px-4 py-6 text-center text-ink-muted">
          ยังวาดกราฟสัดส่วนไม่ได้ เพราะราคาของหุ้นบางตัวไม่มี
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[26rem] text-left text-sm">
          <thead className="border-b border-rule text-ink-muted">
            <tr>
              <th scope="col" className="py-2 pr-3 font-medium">
                หุ้น
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                จำนวน
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                มูลค่าตลาด
              </th>
              <th scope="col" className="py-2 pl-3 text-right font-medium">
                สัดส่วน
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.symbol} className="border-b border-rule align-top last:border-0">
                <th scope="row" className="py-2 pr-3 text-left font-normal">
                  <span className="flex items-center gap-2">
                    {canDraw && (
                      <span
                        aria-hidden="true"
                        className="inline-block size-3 shrink-0 rounded-sm"
                        style={{ background: colorOf(index) }}
                      />
                    )}
                    <span>
                      <span className="block font-semibold">{row.symbol}</span>
                      <span className="block text-xs text-ink-muted">{row.instrument_name}</span>
                    </span>
                  </span>
                </th>
                <td className="px-3 py-2 text-right tabular-nums">{formatQuantity(row.quantity)}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {row.quote ? (
                    <div className="grid justify-items-end gap-1">
                      <Money value={row.market_value} />
                      <QuoteTags quote={row.quote} />
                    </div>
                  ) : (
                    <Money value={row.market_value} />
                  )}
                </td>
                <td className="py-2 pl-3 text-right font-semibold tabular-nums">
                  <Percent value={row.weight_percent} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
