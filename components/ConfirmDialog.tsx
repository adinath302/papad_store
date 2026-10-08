"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onCancel}
        className="absolute inset-0 bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-stone-200 p-5 sm:p-6"
      >
        <h3
          id="confirm-dialog-title"
          className="text-lg font-bold text-stone-900 mb-2"
        >
          {title}
        </h3>
        <p className="text-sm text-stone-600 leading-relaxed mb-6">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-stone-900 hover:bg-stone-800"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
