"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getCurrentUser } from "@/features/auth/api";
import { ApiError } from "@/lib/api";
import type { User } from "@/types";
import { Navbar } from "./Navbar";
import { NAV_ITEMS, SidebarContent, isActive } from "./Sidebar";

// App shell: Navbar + Sidebar render at once; page content waits for /auth/me (proxy.ts only checks cookie presence)
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [failed, setFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace(`/login?from=${encodeURIComponent(pathname)}`);
        } else {
          setFailed(true);
        }
      });
  }, [router, pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  if (failed) {
    return <p className="p-8 text-ink-muted">เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองรีเฟรชหน้านี้อีกครั้ง</p>;
  }

  const title = NAV_ITEMS.find((item) => isActive(pathname, item.href))?.label ?? "Stock Portfolio";
  const close = () => setMenuOpen(false);

  return (
    <div className="flex min-h-dvh flex-1">
      <aside className="hidden w-60 shrink-0 bg-cover md:sticky md:top-0 md:block md:h-dvh">
        <SidebarContent pathname={pathname} />
      </aside>

      <div className={`fixed inset-0 z-40 md:hidden ${menuOpen ? "" : "pointer-events-none"}`} inert={!menuOpen}>
        <div
          onClick={close}
          className={`absolute inset-0 bg-black/50 transition-opacity motion-reduce:transition-none ${menuOpen ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          id="mobile-menu"
          className={`absolute inset-y-0 left-0 w-64 bg-cover transition-transform duration-200 ease-out motion-reduce:transition-none ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent pathname={pathname} onNavigate={close} onClose={close} />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar title={title} email={user?.email} menuOpen={menuOpen} onMenu={() => setMenuOpen(true)} />
        <div className="flex flex-1 flex-col">{user ? children : <p className="p-8 text-ink-muted">กำลังโหลด…</p>}</div>
      </div>
    </div>
  );
}
