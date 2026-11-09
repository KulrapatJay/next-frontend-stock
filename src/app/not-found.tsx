import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-xl font-semibold">404 — ไม่พบหน้านี้</h2>
      <Link href="/" className="underline">
        กลับหน้าแรก
      </Link>
    </main>
  );
}
