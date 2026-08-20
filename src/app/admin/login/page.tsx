import { login } from "@/app/admin/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/admin", error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-1 text-xl font-semibold">Admin sign in</h1>
      <p className="mb-6 text-sm text-neutral-500">Enter the admin password to manage trips.</p>

      {error ? (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Incorrect password. Try again.
        </p>
      ) : null}

      <form action={login} className="flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
          className="rounded-md border border-neutral-300 px-3 py-2 text-base focus:border-neutral-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
