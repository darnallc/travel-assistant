import { ItemType } from "@/generated/prisma";

export const ITEM_TYPE_META: Record<ItemType, { label: string; icon: string }> = {
  FLIGHT: { label: "Flight", icon: "✈️" },
  LODGING: { label: "Lodging", icon: "🏨" },
  ACTIVITY: { label: "Activity", icon: "🗺️" },
  TICKET: { label: "Ticket", icon: "🎟️" },
  TRANSPORT: { label: "Transport", icon: "🚗" },
  FOOD: { label: "Food", icon: "🍽️" },
  OTHER: { label: "Other", icon: "📌" },
};

export const ITEM_TYPES = Object.keys(ITEM_TYPE_META) as ItemType[];
