import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "./Icons";

interface ModalProps { children: ReactNode; description?: string; open: boolean; onClose: () => void; size?: "md" | "lg" | "xl"; title: string; }

export function Modal({ children, description, open, onClose, size = "lg", title }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", closeOnEscape); };
  }, [onClose, open]);
  if (!open) return null;
  const widths = { md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };
  return <div aria-labelledby="modal-title" aria-modal="true" className="fixed inset-0 z-50 grid items-end bg-sky-600/55 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className={`mx-auto flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl ${widths[size]}`}>
      <header className="flex items-start justify-between gap-6 border-b border-slate-200 px-6 py-5"><div><h2 className="text-xl font-bold tracking-tight text-slate-950" id="modal-title">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div><button aria-label="Close dialog" className="icon-button" onClick={onClose} type="button"><CloseIcon className="size-5" /></button></header>
      <div className="overflow-y-auto">{children}</div>
    </section>
  </div>;
}

export function ConfirmDialog({ busy = false, description, onCancel, onConfirm, open, title }: { busy?: boolean; description: string; onCancel: () => void; onConfirm: () => void; open: boolean; title: string }) {
  return <Modal description={description} onClose={onCancel} open={open} size="md" title={title}><div className="flex justify-end gap-3 p-6"><button className="button-secondary" disabled={busy} onClick={onCancel} type="button">Cancel</button><button className="button-danger" disabled={busy} onClick={onConfirm} type="button">{busy ? "Deleting…" : "Delete"}</button></div></Modal>;
}
