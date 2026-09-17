export function WhatsAppButton() {
  const number = String(
    import.meta.env.VITE_WHATSAPP_NUMBER || "250781483960",
  ).replace(/[\s()+-]/g, "");
  if (!/^[1-9]\d{7,14}$/.test(number)) return null;
  const text = encodeURIComponent(
    "Hello BUZIMA BOOSTER GROUP, I would like help with a product or order.",
  );

  return (
    <a
      aria-label="Chat with BUZIMA BOOSTER GROUP on WhatsApp"
      className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-3 rounded-full bg-[#128c4a] p-4 text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:bg-[#0d733b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-700 sm:px-5"
      href={`https://wa.me/${number}?text=${text}`}
      rel="noopener noreferrer"
      target="_blank"
    >
      <svg
        aria-hidden="true"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        viewBox="0 0 24 24"
      >
        <path d="M20.5 11.7a8.6 8.6 0 0 1-12.8 7.5L3 20.5l1.3-4.6a8.6 8.6 0 1 1 16.2-4.2Z" />
        <path d="M8.3 7.3c-.6.2-.9.9-.8 1.6.3 2.7 2.8 5.2 5.5 5.9.7.2 1.7 0 2.1-.6l.5-1-2.1-1.1-.8.8c-1.5-.5-2.6-1.6-3.2-3l.7-.8-.9-1.8Z" />
      </svg>
      <span className="hidden text-sm font-bold sm:block">
        Chat on WhatsApp
      </span>
    </a>
  );
}
