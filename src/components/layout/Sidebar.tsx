import Link from "next/link";
import type { ReactNode } from "react";
import { CloseIcon, DashboardIcon, PortfolioIcon } from "./icons";

// Sidebar (passbook cover column)
export const NAV_ITEMS: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: <DashboardIcon /> },
  { href: "/portfolios", label: "พอร์ต", icon: <PortfolioIcon /> },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = { pathname: string; collapsed?: boolean; onNavigate?: () => void; onClose?: () => void };

export function SidebarContent({ pathname, collapsed = false, onNavigate, onClose }: Props) {
  return (
    <div className={`flex h-full flex-col py-5 text-cover-ink ${collapsed ? "px-2.5" : "px-4"}`}>
      <div className={`flex items-start justify-between gap-2 ${collapsed ? "" : "px-2"}`}>
        <Link
          href="/dashboard"
          onClick={onNavigate}
          aria-label="Stock Portfolio"
          className={`text-xl font-bold leading-tight tracking-tight ${collapsed ? "flex h-14 w-full items-center justify-center" : "h-14 whitespace-nowrap"}`}
        >
          {collapsed ? (
            "SP"
          ) : (
            <>
              Stock
              <br /> Portfolio
            </>
          )}
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
                  title={collapsed ? item.label : undefined}
                  className={`flex h-11 items-center gap-3 whitespace-nowrap rounded text-base transition-colors ${
                    collapsed ? "justify-center" : "px-3"
                  } ${
                    active
                      ? "bg-white/15 font-semibold text-cover-ink"
                      : "text-cover-muted hover:bg-white/10 hover:text-cover-ink"
                  }`}
                >
                  {item.icon}
                  <span className={collapsed ? "sr-only" : undefined}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
