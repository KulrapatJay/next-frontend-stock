import Link from "next/link";
import type { ReactNode } from "react";
import { CloseIcon, DashboardIcon } from "./icons";

// Sidebar (passbook cover column)
export const NAV_ITEMS: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: <DashboardIcon /> },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = { pathname: string; onNavigate?: () => void; onClose?: () => void };

export function SidebarContent({ pathname, onNavigate, onClose }: Props) {
  return (
    <div className="flex h-full flex-col px-4 py-5 text-cover-ink">
      <div className="flex items-start justify-between gap-2 px-2">
        <Link href="/dashboard" onClick={onNavigate} className="text-xl font-bold leading-tight tracking-tight">
          Stock
          <br /> Portfolio
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดเมนู"
            className="-mr-1 -mt-1 inline-flex size-11 items-center justify-center rounded text-cover-muted hover:bg-white/10 hover:text-cover-ink"
          >
            <CloseIcon />
          </button>
        )}
      </div>
      <nav aria-label="เมนูหลัก" className="mt-10">
        <ul className="grid gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-11 items-center gap-3 rounded px-3 text-base transition-colors ${
                    active
                      ? "bg-white/15 font-semibold text-cover-ink"
                      : "text-cover-muted hover:bg-white/10 hover:text-cover-ink"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
