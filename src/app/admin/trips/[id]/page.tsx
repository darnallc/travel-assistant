import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addItem, deleteItem, deleteTrip, updateItem, updateTrip } from "@/app/admin/actions";
import { ITEM_TYPE_META } from "@/lib/itemTypes";
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
    include: { items: { orderBy: { startAt: "asc" } } },
  });

  if (!trip) notFound();

  const publicPath = `/t/${trip.slug}`;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/admin" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← All trips
      </Link>

      <div className="mt-2 mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{trip.name}</h1>
          <p className="text-xs text-neutral-500">
            {trip.startDate.toLocaleDateString()} – {trip.endDate.toLocaleDateString()}
            {trip.destination ? ` · ${trip.destination}` : ""}
          </p>
        </div>
        <form action={deleteTrip.bind(null, trip.id)}>
          <ConfirmSubmitButton
            confirmMessage={`Delete "${trip.name}" and all its items? This cannot be undone.`}
            className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:border-red-400"
          >
            Delete trip
          </ConfirmSubmitButton>
        </form>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
        <span className="truncate">Share link: {publicPath}</span>
        <CopyLinkButton text={publicPath} />
        <Link href={publicPath} target="_blank" className="text-neutral-500 underline">
          Open
        </Link>
      </div>

      <details className="mb-8 rounded-lg border border-neutral-200 p-4">
        <summary className="cursor-pointer text-sm font-medium text-neutral-700">
          Edit trip details
        </summary>
        <form action={updateTrip.bind(null, trip.id)} className="mt-3 grid grid-cols-2 gap-3">
          <input
            name="name"
            defaultValue={trip.name}
            required
            className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            name="destination"
            defaultValue={trip.destination ?? ""}
            placeholder="Destination"
            className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            Start date
            <input
              type="date"
              name="startDate"
              defaultValue={toDateInputValue(trip.startDate)}
              required
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            End date
            <input
              type="date"
              name="endDate"
              defaultValue={toDateInputValue(trip.endDate)}
              required
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
          <input
            name="timezone"
            defaultValue={trip.timezone}
            placeholder="Timezone (e.g. America/Chicago)"
            className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <textarea
            name="coverNote"
            defaultValue={trip.coverNote ?? ""}
            placeholder="Note shown at the top of the public itinerary (optional)"
            rows={2}
            className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="col-span-2 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Save trip details
          </button>
        </form>
      </details>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-700">Add item</h2>
        <form
          action={addItem.bind(null, trip.id)}
          className="rounded-lg border border-neutral-200 p-4"
        >
          <ItemFields />
          <button
            type="submit"
            className="mt-3 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Add item
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-neutral-700">
          Itinerary ({trip.items.length})
        </h2>
        <ul className="flex flex-col gap-2">
          {trip.items.map((item) => (
            <li key={item.id} className="rounded-lg border border-neutral-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {ITEM_TYPE_META[item.type].icon} {item.title}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {item.startAt.toLocaleString()}
                    {item.location ? ` · ${item.location}` : ""}
                  </p>
                </div>
                <form action={deleteItem.bind(null, item.id)}>
                  <ConfirmSubmitButton
                    confirmMessage={`Delete "${item.title}"?`}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-neutral-500">Edit</summary>
                <form action={updateItem.bind(null, item.id)} className="mt-2">
                  <ItemFields defaultValues={item} />
                  <button
                    type="submit"
                    className="mt-3 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                  >
                    Save changes
                  </button>
                </form>
              </details>
            </li>
          ))}
          {trip.items.length === 0 ? (
            <p className="text-sm text-neutral-500">No items yet — add one above.</p>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
