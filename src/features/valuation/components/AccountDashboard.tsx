"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { getAccountValuation } from "@/features/valuation/api";
import { errorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { AccountValuation } from "@/types";
import { AllocationSection } from "./AllocationSection";
import { Money, Percent, Pnl, PnlPercent, Tile } from "./parts";

// Dashboard: every portfolio valued together (all figures come from GET /valuation)
export function AccountDashboard() {
  const [account, setAccount] = useState<AccountValuation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      getAccountValuation()
        .then((data) => {
          setAccount(data);
          setError(null);
        })
        .catch((err) => setError(errorMessage(err))),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const complete = account?.coverage === "complete";
  const anyDemo = account?.allocation.some((row) => row.quote?.is_demo) ?? false;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-8">
      <h1 className="text-2xl font-bold leading-tight">ภาพรวม</h1>

      <div className="mt-6 grid gap-6">
        {error && (
          <Alert>
            {error}{" "}
            <button type="button" onClick={() => load()} className="font-semibold underline">
              ลองอีกครั้ง
            </button>
          </Alert>
        )}
        {!account && !error && <p className="text-ink-muted">กำลังโหลด…</p>}

        {account && account.portfolios.length === 0 && (
          <div className="rounded border border-dashed border-field-border px-6 py-10 text-center">
            <p className="text-lg font-semibold">ยังไม่มีพอร์ต</p>
            <p className="mt-1 text-ink-muted">
              <Link href="/portfolios" className="font-semibold underline">
                สร้างพอร์ตแรก
              </Link>{" "}
              แล้วบันทึกรายการซื้อ ภาพรวมจะมาแสดงที่นี่
            </p>
          </div>
        )}

        {account && account.portfolios.length > 0 && (
          <>
            {anyDemo && <Alert>ราคาที่แสดงเป็นข้อมูลเดโม ไม่ใช่ราคาตลาดจริง</Alert>}
            {!complete && (
              <Alert>
                {account.coverage === "unavailable"
                  ? "ตอนนี้ยังไม่มีราคาของหุ้นที่ถืออยู่ จึงยังแสดงมูลค่าตลาด กำไรขาดทุน และสัดส่วนไม่ได้"
                  : `ยอดรวมยังไม่ครบ เพราะไม่มีราคาของ ${account.missing_symbols.join(", ")}`}
              </Alert>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Tile label={`ต้นทุนคงเหลือ (${account.currency})`}>{formatMoney(account.cost_basis)}</Tile>
              <Tile label="มูลค่าตลาด" note={complete ? undefined : "รวมเฉพาะหุ้นที่มีราคา"}>
                {formatMoney(
                  complete && account.market_value !== null ? account.market_value : account.priced_market_value,
                )}
              </Tile>
              <Tile label="กำไร/ขาดทุนที่ยังไม่ขาย" note={complete ? undefined : "คำนวณไม่ได้จนกว่าจะมีราคาครบ"}>
                <Pnl value={account.unrealized_pnl} />
                <span className="ml-2 text-base font-semibold">
                  <PnlPercent value={account.unrealized_pnl_percent} />
                </span>
              </Tile>
              <Tile label="กำไร/ขาดทุนที่ขายแล้ว">
                <Pnl value={account.realized_pnl} />
              </Tile>
            </div>

            <AllocationSection account={account} />

            <section aria-labelledby="portfolios-heading">
              <h2 id="portfolios-heading" className="text-xl font-bold leading-tight">
                แยกตามพอร์ต
              </h2>
              <div className="mt-3 overflow-x-auto rounded border border-rule bg-field">
                <table className="w-full min-w-[48rem] text-left text-sm">
                  <thead className="border-b border-rule text-ink-muted">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">
                        พอร์ต
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">
                        ต้นทุนคงเหลือ
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
                        % ของบัญชี
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {account.portfolios.map((portfolio) => (
                      <tr key={portfolio.portfolio_id} className="border-b border-rule align-top last:border-0">
                        <th scope="row" className="px-4 py-3 text-left font-normal">
                          <Link
                            href={`/portfolios/${portfolio.portfolio_id}`}
                            className="font-semibold break-words underline decoration-rule hover:decoration-ink"
                          >
                            {portfolio.name}
                          </Link>
                          {portfolio.coverage !== "complete" && (
                            <span className="mt-1 block text-xs text-ink-muted">ราคาไม่ครบ</span>
                          )}
                        </th>
                        <td className="px-4 py-3 text-right tabular-nums">{formatMoney(portfolio.cost_basis)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <Money value={portfolio.market_value} />
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">
                          <PnlPercent value={portfolio.unrealized_pnl_percent} />
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <Pnl value={portfolio.unrealized_pnl} />
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <Percent value={portfolio.weight_percent} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <p className="rounded border border-dashed border-field-border px-4 py-3 text-sm text-ink-muted text-pretty">
              กราฟเทียบผลตอบแทนกับ S&amp;P 500 และ Nasdaq-100 ยังไม่มีในตอนนี้ เพราะ backend ยังไม่มีข้อมูลราคาย้อนหลัง
            </p>

            <p className="text-sm text-ink-muted text-pretty">
              ราคาเป็นราคาล่าช้า (ระบุจำนวนนาทีไว้ที่แต่ละราคา) ไม่ใช่ราคาเสนอซื้อขายหรือราคาที่ซื้อขายได้จริง
              ต้นทุนคิดแบบถัวเฉลี่ยถ่วงน้ำหนัก กำไร/ขาดทุนที่ยังไม่ขายยังไม่หักค่าธรรมเนียมขายในอนาคต
              ระบบยังไม่รองรับเงินปันผล การแตกหุ้น การควบรวม และการเปลี่ยนชื่อย่อ ตัวเลขจึงอาจไม่ครบ และไม่ใช่รายงานภาษี
              เครื่องหมาย – ในช่อง % แปลว่าไม่มีข้อมูล ไม่ใช่ 0% คำนวณเมื่อ {formatDateTime(account.calculated_at)}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
