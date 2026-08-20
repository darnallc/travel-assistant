import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createTrip, logout } from "@/app/admin/actions";

export default async function AdminHomePage() {
  const trips = await prisma.trip.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Trips</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-neutral-500 hover:text-neutral-900">
            Sign out
          </button>
        </form>
      </div>

      <section className="mb-8 rounded-lg border border-neutral-200 p-4">
        <h2 className="mb-3 text-sm font-medium text-neutral-700">New trip</h2>
        <form action={createTrip} className="grid grid-cols-2 gap-3">
          <input
            name="name"
            placeholder="Trip name (e.g. Japan 2026)"
            required
            className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            name="destination"
            placeholder="Destination (optional)"
            className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            Start date
            <input
              type="date"
              name="startDate"
              required
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            End date
            <input
              type="date"
              name="endDate"
              required
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="col-span-2 mt-1 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Create trip
          </button>
        </form>
      </section>

      <ul className="flex flex-col gap-2">
        {trips.map((trip) => (
          <li key={trip.id}>
            <Link
              href={`/admin/trips/${trip.id}`}
              className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 hover:border-neutral-400"
            >
              <div>
                <p className="font-medium">{trip.name}</p>
                <p className="text-xs text-neutral-500">
                  {trip.startDate.toLocaleDateString()} – {trip.endDate.toLocaleDateString()}
                  {trip.destination ? ` · ${trip.destination}` : ""}
                </p>
              </div>
              <span className="text-xs text-neutral-400">{trip._count.items} items</span>
            </Link>
          </li>
        ))}
        {trips.length === 0 ? (
          <p className="text-sm text-neutral-500">No trips yet — create one above.</p>
        ) : null}
      </ul>
    </main>
  );
}
