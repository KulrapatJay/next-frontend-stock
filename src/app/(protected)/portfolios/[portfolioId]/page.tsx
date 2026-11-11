import type { Metadata } from "next";
import { Suspense } from "react";
import { PortfolioDetail } from "@/features/portfolios/components/PortfolioDetail";

export const metadata: Metadata = { title: "รายละเอียดพอร์ต · Stock Portfolio" };

export default function PortfolioPage() {
  return (
    <Suspense>
      <PortfolioDetail />
    </Suspense>
  );
}
