import { useState, type FormEvent } from "react";
import type { Address, AddressInput } from "../../types/orders";
const field =
  "w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0ea5e9]";
const empty: AddressInput = {
  fullName: "",
  phone: "",
  country: "Rwanda",
  city: "",
  district: "",
  sector: "",
  addressLine: "",
  landmark: "",
  postalCode: "",
  isDefault: false,
};
export function AddressForm({
  address,
  onCancel,
  onSave,
}: {
  address?: Address;
  onCancel?: () => void;
  onSave: (input: AddressInput) => Promise<void>;
}) {
  const [input, setInput] = useState<AddressInput>(
    address
      ? {
          fullName: address.fullName,
          phone: address.phone,
          country: address.country,
          city: address.city,
          district: address.district,
          sector: address.sector,
          addressLine: address.addressLine,
          landmark: address.landmark,
          postalCode: address.postalCode,
          isDefault: address.isDefault,
        }
      : empty,
  );
  const [saving, setSaving] = useState(false);
  function change(name: keyof AddressInput, value: string | boolean) {
    setInput((current) => ({ ...current, [name]: value }));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(input);
    } finally {
      setSaving(false);
    }
  }
  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(event) => void submit(event)}
    >
      <label className="text-sm font-bold">
        Full name
        <input
          className={field}
          onChange={(e) => change("fullName", e.target.value)}
          required
          value={input.fullName}
        />
      </label>
      <label className="text-sm font-bold">
        Phone
        <input
          className={field}
          onChange={(e) => change("phone", e.target.value)}
          required
          value={input.phone}
        />
      </label>
      <label className="text-sm font-bold">
        Country
        <input
          className={field}
          onChange={(e) => change("country", e.target.value)}
          required
          value={input.country}
        />
      </label>
      <label className="text-sm font-bold">
        City
        <input
          className={field}
          onChange={(e) => change("city", e.target.value)}
          required
          value={input.city}
        />
      </label>
      <label className="text-sm font-bold">
        District
        <input
          className={field}
          onChange={(e) => change("district", e.target.value)}
          value={input.district}
        />
      </label>
      <label className="text-sm font-bold">
        Sector
        <input
          className={field}
          onChange={(e) => change("sector", e.target.value)}
          value={input.sector}
        />
      </label>
      <label className="text-sm font-bold sm:col-span-2">
        Address line
        <input
          className={field}
          onChange={(e) => change("addressLine", e.target.value)}
          required
          value={input.addressLine}
        />
      </label>
      <label className="text-sm font-bold">
        Landmark
        <input
          className={field}
          onChange={(e) => change("landmark", e.target.value)}
          value={input.landmark}
        />
      </label>
      <label className="text-sm font-bold">
        Postal code
        <input
          className={field}
          onChange={(e) => change("postalCode", e.target.value)}
          value={input.postalCode}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-bold sm:col-span-2">
        <input
          checked={input.isDefault}
          onChange={(e) => change("isDefault", e.target.checked)}
          type="checkbox"
        />{" "}
        Make this my default address
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button
          className="rounded-xl bg-[#0ea5e9] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
          disabled={saving}
          type="submit"
        >
          {saving ? "Saving…" : "Save address"}
        </button>
        {onCancel && (
          <button
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
