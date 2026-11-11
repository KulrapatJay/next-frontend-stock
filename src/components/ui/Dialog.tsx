"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

// Modal dialog (open while mounted)
export function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto w-[min(calc(100vw-2rem),30rem)] rounded border border-rule bg-page p-0 text-ink backdrop:bg-black/50"
    >
      <div className="grid gap-6 p-6">
        <h2 id={titleId} className="text-xl font-bold leading-tight">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
