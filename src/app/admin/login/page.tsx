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
      <p className="mb-6 text-sm text-neutral-400">Enter the admin password to manage trips.</p>

      {error ? (
        <p className="mb-4 rounded-md bg-red-950 px-3 py-2 text-sm text-red-300">
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
          className="field text-base"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-300"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
