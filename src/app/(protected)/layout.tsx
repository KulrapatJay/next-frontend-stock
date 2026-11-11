import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";

// Layout หน้าที่ต้อง login (Suspense: AppShell reads the pathname, which is runtime data on dynamic routes)
export default function ProtectedLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
