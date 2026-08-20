import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-2 text-2xl font-semibold">Travel Assistant</h1>
      <p className="mb-6 text-sm text-neutral-400">
        A lightweight itinerary tracker. Trips are shared via private links.
      </p>
      <Link
        href="/admin"
        className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-300"
      >
        Go to admin
      </Link>
    </main>
  );
}
