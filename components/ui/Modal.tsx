"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Centered dialog used for write-actions (create customer, new order, etc.).
 * Closes on backdrop click or Escape. Depth comes from a hairline border on a
 * solid surface over a dimmed backdrop — no shadows (brand rule).
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-md";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Darker backdrop so the modal pops clearly against the cinema surface */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[92vh] w-full ${maxW} flex-col rounded-2xl border border-white/[0.08] bg-cinema-elev shadow-cinema-float`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[17px] font-medium tracking-[-0.01em] text-white">{title}</h2>
            {description && <p className="mt-0.5 text-[13px] text-white/55">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 -mt-1 shrink-0 rounded-md p-1.5 text-white/45 hover:bg-white/[0.06] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
