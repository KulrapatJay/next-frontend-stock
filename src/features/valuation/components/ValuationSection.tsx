"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { getValuation } from "@/features/valuation/api";
import { errorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney, formatQuantity } from "@/lib/format";
import type { Position, Valuation } from "@/types";
import { Money, Percent, Pnl, PnlPercent, QuoteTags, Tile } from "./parts";

// Holdings and delayed-price valuation of one portfolio (all figures come from the API)
const REASON: Record<string, string> = {
  no_price: "ไม่มีราคา",
  provider_unavailable: "ผู้ให้บริการราคาขัดข้อง",
};

function PriceCell({ position }: { position: Position }) {
  const { quote } = position;
  if (!quote) {
    return <span className="text-ink-muted">{REASON[position.unavailable_reason ?? ""] ?? "ไม่มีราคา"}</span>;
  }
  return (
    <div className="grid justify-items-end gap-1">
      <span className="tabular-nums">{formatMoney(quote.price)}</span>
      <span className="text-xs text-ink-muted">ณ {formatDateTime(quote.as_of)}</span>
      <QuoteTags quote={quote} />
    </div>
  );
}

export function ValuationSection({ portfolioId, refreshKey }: { portfolioId: string; refreshKey: number }) {
  const [valuation, setValuation] = useState<Valuation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      getValuation(portfolioId)
        .then((data) => {
          setValuation(data);
          setError(null);
        })
        .catch((err) => setError(errorMessage(err))),
    [portfolioId],
  );

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const complete = valuation?.coverage === "complete";
  const anyDemo = valuation?.positions.some((position) => position.quote?.is_demo) ?? false;

  return (
    <section aria-labelledby="holdings-heading" className="mt-8">
      <h2 id="holdings-heading" className="text-xl font-bold leading-tight">
        หุ้นที่ถือ
      </h2>

      <div className="mt-4 grid gap-4">
        {error && (
          <Alert>
            {error}{" "}
            <button type="button" onClick={() => load()} className="font-semibold underline">
              ลองอีกครั้ง
            </button>
          </Alert>
        )}
        {!valuation && !error && <p className="text-ink-muted">กำลังโหลด…</p>}

        {valuation && valuation.positions.length === 0 && (
          <div className="rounded border border-dashed border-field-border px-6 py-10 text-center">
            <p className="text-lg font-semibold">ยังไม่มีหุ้นในพอร์ต</p>
            <p className="mt-1 text-ink-muted">บันทึกรายการซื้อด้านล่าง แล้วหุ้นจะมาแสดงที่นี่</p>
          </div>
        )}

        {valuation && valuation.positions.length > 0 && (
          <>
            {anyDemo && <Alert>ราคาที่แสดงเป็นข้อมูลเดโม ไม่ใช่ราคาตลาดจริง</Alert>}
            {!complete && (
              <Alert>
                {valuation.coverage === "unavailable"
                  ? "ตอนนี้ยังไม่มีราคาของหุ้นในพอร์ต จึงยังแสดงมูลค่าตลาดและกำไรขาดทุนที่ยังไม่ขายไม่ได้"
                  : `ยอดรวมยังไม่ครบ เพราะไม่มีราคาของ ${valuation.missing_symbols.join(", ")}`}
              </Alert>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Tile label={`ต้นทุนคงเหลือ (${valuation.currency})`}>{formatMoney(valuation.cost_basis)}</Tile>
              <Tile label="มูลค่าตลาด" note={complete ? undefined : "รวมเฉพาะหุ้นที่มีราคา"}>
                {formatMoney(
                  complete && valuation.market_value !== null ? valuation.market_value : valuation.priced_market_value,
                )}
              </Tile>
              <Tile label="กำไร/ขาดทุนที่ยังไม่ขาย" note={complete ? undefined : "คำนวณไม่ได้จนกว่าจะมีราคาครบ"}>
                <Pnl value={valuation.unrealized_pnl} />
                <span className="ml-2 text-base font-semibold">
                  <PnlPercent value={valuation.unrealized_pnl_percent} />
                </span>
              </Tile>
              <Tile label="กำไร/ขาดทุนที่ขายแล้ว">
                <Pnl value={valuation.realized_pnl} />
              </Tile>
            </div>

            <div className="overflow-x-auto rounded border border-rule bg-field">
              <table className="w-full min-w-[64rem] text-left text-sm">
                <thead className="border-b border-rule text-ink-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">
                      หุ้น
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      จำนวน
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      ต้นทุนเฉลี่ย
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      ราคา
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      มูลค่าตลาด
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      % เปลี่ยนแปลง
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      กำไร/ขาดทุน
                      <br />
                      ที่ยังไม่ขาย
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      % ของพอร์ต
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      กำไร/ขาดทุน
                      <br />
                      ที่ขายแล้ว
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {valuation.positions.map((position) => (
                    <tr key={position.symbol} className="border-b border-rule align-top last:border-0">
                      <th scope="row" className="px-4 py-3 text-left font-normal">
                        <span className="block font-semibold">{position.symbol}</span>
                        <span className="block text-xs text-ink-muted">{position.instrument_name}</span>
                      </th>
                      <td className="px-4 py-3 text-right tabular-nums">{formatQuantity(position.quantity)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatMoney(position.average_cost)}</td>
                      <td className="px-4 py-3 text-right">
                        <PriceCell position={position} />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <Money value={position.market_value} />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        <PnlPercent value={position.unrealized_pnl_percent} />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <Pnl value={position.unrealized_pnl} />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <Percent value={position.weight_percent} />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <Pnl value={position.realized_pnl} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-ink-muted text-pretty">
              ราคาเป็นราคาล่าช้า (ระบุจำนวนนาทีไว้ที่แต่ละราคา) ไม่ใช่ราคาเสนอซื้อขายหรือราคาที่ซื้อขายได้จริง
              ต้นทุนคิดแบบถัวเฉลี่ยถ่วงน้ำหนัก กำไร/ขาดทุนที่ยังไม่ขายยังไม่หักค่าธรรมเนียมขายในอนาคต เครื่องหมาย –
              ในช่อง % แปลว่าไม่มีข้อมูล ไม่ใช่ 0% ระบบยังไม่รองรับเงินปันผล การแตกหุ้น การควบรวม และการเปลี่ยนชื่อย่อ
              ตัวเลขจึงอาจไม่ครบ และไม่ใช่รายงานภาษี คำนวณเมื่อ {formatDateTime(valuation.calculated_at)}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
