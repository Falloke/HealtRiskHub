"use client";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode; // เนื้อหาสรุป
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  disabled?: boolean;
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "ยืนยันการทำรายการ?",
  description,
  children,
  cancelText = "แก้ไข",
  confirmText = "ยืนยัน",
  onConfirm,
  disabled,
}: Props) {
  // ปิดด้วย Esc + ล็อก scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" role="dialog" aria-modal="true">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      {/* card */}
      <div className="relative z-[61] w-[90%] max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>

        {children && <div className="mb-4">{children}</div>}

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border px-4 py-2 text-sm"
            onClick={() => onOpenChange(false)}
            disabled={disabled}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="rounded-md bg-pink-500 px-4 py-2 text-sm text-white hover:bg-pink-600 disabled:opacity-60"
            onClick={onConfirm}
            disabled={disabled}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
