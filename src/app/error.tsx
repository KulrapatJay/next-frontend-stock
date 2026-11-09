"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-xl font-semibold">เกิดข้อผิดพลาด</h2>
      <button
        onClick={() => retry()}
        className="rounded bg-foreground px-4 py-2 text-background"
      >
        ลองอีกครั้ง
      </button>
    </main>
  );
}
