import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  addItem,
  deleteItem,
  deleteTrip,
  moveItem,
  updateItem,
  updateTrip,
} from "@/app/admin/actions";
import { ITEM_TYPE_META } from "@/lib/itemTypes";
import { groupItemsByDay } from "@/lib/formatting";
import { ItemFields } from "@/components/ItemFields";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { CopyLinkButton } from "@/components/CopyLinkButton";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function TripAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { items: { orderBy: [{ sortOrder: "asc" }, { startAt: "asc" }] } },
  });

  if (!trip) notFound();

  const publicPath = `/t/${trip.slug}`;
  const days = groupItemsByDay(trip.items, trip.timezone);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/admin" className="text-sm text-neutral-400 hover:text-neutral-100">
        ← All trips
      </Link>

      <div className="mt-2 mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{trip.name}</h1>
          <p className="text-xs text-neutral-400">
            {trip.startDate.toLocaleDateString()} – {trip.endDate.toLocaleDateString()}
            {trip.destination ? ` · ${trip.destination}` : ""}
          </p>
        </div>
        <form action={deleteTrip.bind(null, trip.id)}>
          <ConfirmSubmitButton
            confirmMessage={`Delete "${trip.name}" and all its items? This cannot be undone.`}
            className="rounded-md border border-red-900 px-2 py-1 text-xs text-red-400 hover:border-red-700"
          >
            Delete trip
          </ConfirmSubmitButton>
        </form>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-400">
        <span className="truncate">Share link: {publicPath}</span>
        <CopyLinkButton text={publicPath} />
        <Link href={publicPath} target="_blank" className="text-neutral-400 underline">
          Open
        </Link>
      </div>

      <details className="mb-8 rounded-lg border border-neutral-800 p-4">
        <summary className="cursor-pointer text-sm font-medium text-neutral-300">
          Edit trip details
        </summary>
        <form action={updateTrip.bind(null, trip.id)} className="mt-3 grid grid-cols-2 gap-3">
          <input
            name="name"
            defaultValue={trip.name}
            required
            className="field col-span-2"
          />
          <input
            name="destination"
            defaultValue={trip.destination ?? ""}
            placeholder="Destination"
            className="field col-span-2"
          />
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Start date
            <input
              type="date"
              name="startDate"
              defaultValue={toDateInputValue(trip.startDate)}
              required
              className="field"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            End date
            <input
              type="date"
              name="endDate"
              defaultValue={toDateInputValue(trip.endDate)}
              required
              className="field"
            />
          </label>
          <input
            name="timezone"
            defaultValue={trip.timezone}
            placeholder="Timezone (e.g. America/Chicago)"
            className="field col-span-2"
          />
          <textarea
            name="coverNote"
            defaultValue={trip.coverNote ?? ""}
            placeholder="Note shown at the top of the public itinerary (optional)"
            rows={2}
            className="field col-span-2"
          />
          <button
            type="submit"
            className="col-span-2 rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-300"
          >
            Save trip details
          </button>
        </form>
      </details>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-300">Add item</h2>
        <form
          action={addItem.bind(null, trip.id)}
          className="rounded-lg border border-neutral-800 p-4"
        >
          <ItemFields />
          <button
            type="submit"
            className="mt-3 rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-300"
          >
            Add item
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-neutral-300">
          Itinerary ({trip.items.length})
        </h2>
        <div className="flex flex-col gap-6">
          {days.map((day) => (
            <div key={day.key}>
              <h3 className="mb-2 text-xs font-semibold text-neutral-400">{day.heading}</h3>
              <ul className="flex flex-col gap-2">
                {day.items.map((item, index) => (
                  <li key={item.id} className="rounded-lg border border-neutral-800 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-2">
                        <div className="flex flex-col gap-0.5 pt-0.5">
                          <form action={moveItem.bind(null, item.id, "up")}>
                            <button
                              type="submit"
                              disabled={index === 0}
                              aria-label="Move up"
                              className="flex h-5 w-5 items-center justify-center rounded text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-20 disabled:hover:bg-transparent"
                            >
                              ▲
                            </button>
                          </form>
                          <form action={moveItem.bind(null, item.id, "down")}>
                            <button
                              type="submit"
                              disabled={index === day.items.length - 1}
                              aria-label="Move down"
                              className="flex h-5 w-5 items-center justify-center rounded text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-20 disabled:hover:bg-transparent"
                            >
                              ▼
                            </button>
                          </form>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {ITEM_TYPE_META[item.type].icon} {item.title}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {item.startAt.toLocaleString()}
                            {item.location ? ` · ${item.location}` : ""}
                          </p>
                        </div>
                      </div>
                      <form action={deleteItem.bind(null, item.id)}>
                        <ConfirmSubmitButton
                          confirmMessage={`Delete "${item.title}"?`}
                          className="shrink-0 rounded-md border border-red-900 px-2 py-1 text-xs text-red-400 hover:border-red-700 hover:bg-red-950"
                        >
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-neutral-400">Edit</summary>
                      <form action={updateItem.bind(null, item.id)} className="mt-2">
                        <ItemFields defaultValues={item} />
                        <button
                          type="submit"
                          className="mt-3 rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-300"
                        >
                          Save changes
                        </button>
                      </form>
                    </details>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {trip.items.length === 0 ? (
            <p className="text-sm text-neutral-400">No items yet — add one above.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
