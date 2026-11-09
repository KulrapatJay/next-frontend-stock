import Link from "next/link";
import type { ReactNode } from "react";

// Passbook shell
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col md:flex-row">
      <aside className="flex flex-col justify-between bg-cover px-6 py-5 text-cover-ink md:w-2/5 md:min-w-[360px] md:px-14 md:py-16">
        <Link href="/" className="w-fit text-2xl font-bold leading-tight tracking-tight md:text-5xl">
          Stock
          <br className="hidden md:block" /> Portfolio
        </Link>
        <p className="hidden max-w-xs text-lg leading-relaxed text-cover-muted md:block">
          บันทึกการซื้อขายหุ้นของคุณเอง ทุกยอดตรวจย้อนกลับไปถึงรายการได้
        </p>
      </aside>
      <main className="ruled flex-1 px-6 py-10 md:px-20 md:py-20">
        <div className="w-full max-w-[440px]">{children}</div>
      </main>
    </div>
  );
}
