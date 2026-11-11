import type { Metadata } from "next";
import { PortfolioList } from "@/features/portfolios/components/PortfolioList";

export const metadata: Metadata = { title: "พอร์ต · Stock Portfolio" };

export default function PortfoliosPage() {
  return <PortfolioList />;
}
