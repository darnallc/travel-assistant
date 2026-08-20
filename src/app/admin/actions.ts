"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";
import { ItemType } from "@/generated/prisma";
import { ITEM_TYPES } from "@/lib/itemTypes";

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD ?? "";
  const next = String(formData.get("next") ?? "/admin");

  if (!expected || !timingSafeEqual(password, expected)) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function createTrip(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim() || null;
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");

  if (!name || !startDate || !endDate) {
    throw new Error("Name, start date, and end date are required");
  }

  const base = slugify(name) || "trip";
  let slug = base;
  let suffix = 1;
  while (await prisma.trip.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  const trip = await prisma.trip.create({
    data: {
      name,
      slug,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/trips/${trip.id}`);
}

export async function updateTrip(tripId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim() || null;
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const timezone = String(formData.get("timezone") ?? "UTC").trim() || "UTC";
  const coverNote = String(formData.get("coverNote") ?? "").trim() || null;

  if (!name || !startDate || !endDate) {
    throw new Error("Name, start date, and end date are required");
  }

  await prisma.trip.update({
    where: { id: tripId },
    data: {
      name,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      timezone,
      coverNote,
    },
  });

  revalidatePath(`/admin/trips/${tripId}`);
  revalidatePath("/admin");
}

export async function deleteTrip(tripId: string) {
  const trip = await prisma.trip.delete({ where: { id: tripId } });
  revalidatePath("/admin");
  revalidatePath(`/t/${trip.slug}`);
  redirect("/admin");
}

function parseItemType(value: FormDataEntryValue | null): ItemType {
  const str = String(value ?? "");
  if ((ITEM_TYPES as string[]).includes(str)) {
    return str as ItemType;
  }
  return "OTHER";
}

export async function addItem(tripId: string, formData: FormData) {
  const type = parseItemType(formData.get("type"));
  const title = String(formData.get("title") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim() || null;
  const startAt = String(formData.get("startAt") ?? "");
  const endAtRaw = String(formData.get("endAt") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const url = String(formData.get("url") ?? "").trim() || null;

  if (!title || !startAt) {
    throw new Error("Title and start date/time are required");
  }

  await prisma.item.create({
    data: {
      tripId,
      type,
      title,
      location,
      startAt: new Date(startAt),
      endAt: endAtRaw ? new Date(endAtRaw) : null,
      confirmation,
      notes,
      url,
    },
  });

  const trip = await prisma.trip.findUniqueOrThrow({ where: { id: tripId } });
  revalidatePath(`/admin/trips/${tripId}`);
  revalidatePath(`/t/${trip.slug}`);
}

export async function updateItem(itemId: string, formData: FormData) {
  const type = parseItemType(formData.get("type"));
  const title = String(formData.get("title") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim() || null;
  const startAt = String(formData.get("startAt") ?? "");
  const endAtRaw = String(formData.get("endAt") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const url = String(formData.get("url") ?? "").trim() || null;

  if (!title || !startAt) {
    throw new Error("Title and start date/time are required");
  }

  const item = await prisma.item.update({
    where: { id: itemId },
    data: {
      type,
      title,
      location,
      startAt: new Date(startAt),
      endAt: endAtRaw ? new Date(endAtRaw) : null,
      confirmation,
      notes,
      url,
    },
    include: { trip: true },
  });

  revalidatePath(`/admin/trips/${item.tripId}`);
  revalidatePath(`/t/${item.trip.slug}`);
}

export async function deleteItem(itemId: string) {
  const item = await prisma.item.delete({ where: { id: itemId }, include: { trip: true } });
  revalidatePath(`/admin/trips/${item.tripId}`);
  revalidatePath(`/t/${item.trip.slug}`);
}
