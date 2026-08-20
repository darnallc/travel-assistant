type ItineraryItem = {
  id: string;
  startAt: Date;
  [key: string]: unknown;
};

export function dayKey(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, dateStyle: "short" }).format(date);
}

export function formatDayHeading(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function groupItemsByDay<T extends ItineraryItem>(items: T[], timeZone: string) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = dayKey(item.startAt, timeZone);
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, dayItems]) => ({
      key,
      heading: formatDayHeading(dayItems[0].startAt, timeZone),
      items: dayItems,
    }));
}
