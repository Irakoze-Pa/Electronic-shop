import { useRef, useState, type ChangeEvent } from "react";
import { uploadImage } from "../../api/catalog";
import { formatApiError } from "../../utils/format";

export function ImageUploadButton({
  multiple = false,
  onUploaded,
}: {
  multiple?: boolean;
  onUploaded: (urls: string[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function change(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const images = await Promise.all(files.map(uploadImage));
      onUploaded(images.map((image) => image.url));
    } catch (reason: unknown) {
      setError(formatApiError(reason));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div>
      <input
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        multiple={multiple}
        onChange={(event) => void change(event)}
        ref={input}
        type="file"
      />
      <button
        className="rounded-xl border border-[#1F88C9] px-4 py-2 text-sm font-bold text-[#1F88C9] disabled:opacity-50"
        disabled={uploading}
        onClick={() => input.current?.click()}
        type="button"
      >
        {uploading ? "Uploading…" : multiple ? "Upload images" : "Upload image"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
