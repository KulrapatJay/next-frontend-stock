import type { Metadata } from "next";
import { AccountDashboard } from "@/features/valuation/components/AccountDashboard";

export const metadata: Metadata = { title: "ภาพรวม · Stock Portfolio" };

export default function DashboardPage() {
  return <AccountDashboard />;
}
