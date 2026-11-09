import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center gap-6 border-b border-black/10 px-6 py-4 dark:border-white/10">
      <Link href="/dashboard" className="font-semibold">
        Stock Portfolio
      </Link>
    </nav>
  );
}
