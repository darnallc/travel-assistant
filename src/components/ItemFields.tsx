import { ITEM_TYPE_META, ITEM_TYPES } from "@/lib/itemTypes";
import type { ItemType } from "@/generated/prisma";

function toLocalInputValue(date: Date | null | undefined) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function ItemFields({
  defaultValues,
}: {
  defaultValues?: {
    type: ItemType;
    title: string;
    location: string | null;
    startAt: Date;
    endAt: Date | null;
    confirmation: string | null;
    notes: string | null;
    url: string | null;
  };
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <select
        name="type"
        defaultValue={defaultValues?.type ?? "ACTIVITY"}
        className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm sm:col-span-1"
      >
        {ITEM_TYPES.map((type) => (
          <option key={type} value={type}>
            {ITEM_TYPE_META[type].icon} {ITEM_TYPE_META[type].label}
          </option>
        ))}
      </select>
      <input
        name="title"
        placeholder="Title (e.g. UA 892 to NRT)"
        defaultValue={defaultValues?.title}
        required
        className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm sm:col-span-1"
      />
      <label className="col-span-1 flex flex-col gap-1 text-xs text-neutral-500">
        Starts
        <input
          type="datetime-local"
          name="startAt"
          defaultValue={toLocalInputValue(defaultValues?.startAt)}
          required
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="col-span-1 flex flex-col gap-1 text-xs text-neutral-500">
        Ends (optional)
        <input
          type="datetime-local"
          name="endAt"
          defaultValue={toLocalInputValue(defaultValues?.endAt)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>
      <input
        name="location"
        placeholder="Location"
        defaultValue={defaultValues?.location ?? ""}
        className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm sm:col-span-1"
      />
      <input
        name="confirmation"
        placeholder="Confirmation #"
        defaultValue={defaultValues?.confirmation ?? ""}
        className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm sm:col-span-1"
      />
      <input
        name="url"
        placeholder="Link (optional)"
        defaultValue={defaultValues?.url ?? ""}
        className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
      <textarea
        name="notes"
        placeholder="Notes"
        defaultValue={defaultValues?.notes ?? ""}
        rows={2}
        className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
