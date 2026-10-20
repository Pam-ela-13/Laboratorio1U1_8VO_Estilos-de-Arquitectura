import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="font-display text-2xl font-bold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-ink"
            aria-label="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
}