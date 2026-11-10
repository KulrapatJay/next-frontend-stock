import { AppShell } from "@/components/layout/AppShell";

// Layout หน้าที่ต้อง login
export default function ProtectedLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
