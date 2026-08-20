import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ITEM_TYPE_META } from "@/lib/itemTypes";
import { formatTime, groupItemsByDay } from "@/lib/formatting";
import type { Metadata } from "next";

export const revalidate = 0;

async function getTrip(slug: string) {
  return prisma.trip.findUnique({
    where: { slug },
    include: { items: { orderBy: [{ sortOrder: "asc" }, { startAt: "asc" }] } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTrip(slug);
  return { title: trip ? `${trip.name} · Itinerary` : "Trip not found" };
}

export default async function PublicTripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = await getTrip(slug);

  if (!trip) notFound();

  const days = groupItemsByDay(trip.items, trip.timezone);

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-white px-4 pb-16 pt-8">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          {trip.startDate.toLocaleDateString()} – {trip.endDate.toLocaleDateString()}
        </p>
        <h1 className="text-2xl font-semibold">{trip.name}</h1>
        {trip.destination ? <p className="text-sm text-neutral-500">{trip.destination}</p> : null}
        {trip.coverNote ? (
          <p className="mt-3 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
            {trip.coverNote}
          </p>
        ) : null}
      </header>

      {days.length === 0 ? (
        <p className="text-sm text-neutral-500">Nothing on the itinerary yet — check back soon.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {days.map((day) => (
            <section key={day.key}>
              <h2 className="sticky top-0 -mx-4 mb-3 bg-white px-4 py-2 text-sm font-semibold text-neutral-900">
                {day.heading}
              </h2>
              <ol className="flex flex-col gap-3">
                {day.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-3 rounded-lg border border-neutral-200 p-3"
                  >
                    <span className="text-xl leading-none" aria-hidden>
                      {ITEM_TYPE_META[item.type].icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="shrink-0 text-xs text-neutral-500">
                          {formatTime(item.startAt, trip.timezone)}
                        </p>
                      </div>
                      {item.location ? (
                        <p className="text-xs text-neutral-500">{item.location}</p>
                      ) : null}
                      {item.confirmation ? (
                        <p className="mt-1 text-xs text-neutral-400">
                          Confirmation: {item.confirmation}
                        </p>
                      ) : null}
                      {item.notes ? (
                        <p className="mt-1 text-sm text-neutral-600">{item.notes}</p>
                      ) : null}
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block text-xs text-blue-600 underline"
                        >
                          View link
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
