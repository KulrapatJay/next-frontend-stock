"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { logout } from "@/features/auth/api";
import { LogoutIcon, MenuIcon } from "./icons";

// Top bar: page title, account, logout
type Props = {
  title: string;
  email?: string;
  menuOpen: boolean;
  onMenu: () => void;
  sidebarOpen: boolean;
  onSidebar: () => void;
};

export function Navbar({ title, email, menuOpen, onMenu, sidebarOpen, onSidebar }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function signOut() {
    setPending(true);
    setFailed(false);
    try {
      await logout();
      router.replace("/login");
    } catch {
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-rule bg-page px-4 md:px-8">
      <button
        type="button"
        onClick={onMenu}
        aria-label="เปิดเมนู"
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        className="-ml-2 inline-flex size-11 items-center justify-center rounded text-ink hover:bg-rule md:hidden"
      >
        <MenuIcon />
      </button>
      <button
        type="button"
        onClick={onSidebar}
        aria-label={sidebarOpen ? "ย่อเมนู" : "ขยายเมนู"}
        aria-expanded={sidebarOpen}
        aria-controls="sidebar"
        className="-ml-3 hidden size-11 items-center justify-center rounded text-ink hover:bg-rule md:inline-flex"
      >
        <MenuIcon />
      </button>
      <Link href="/dashboard" className="font-bold md:hidden">
        Stock Portfolio
      </Link>
      <p className="hidden text-lg font-semibold md:block">{title}</p>
      <div className="ml-auto flex items-center gap-3">
        {failed && (
          <span role="alert" className="hidden text-sm text-danger sm:inline">
            ออกจากระบบไม่สำเร็จ ลองอีกครั้ง
          </span>
        )}
        <span className="hidden max-w-[28ch] truncate text-sm text-ink-muted sm:inline" title={email}>
          {email}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={signOut}
          pending={pending}
          pendingLabel="กำลังออก…"
        >
          <LogoutIcon />
          ออกจากระบบ
        </Button>
      </div>
    </header>
  );
}
