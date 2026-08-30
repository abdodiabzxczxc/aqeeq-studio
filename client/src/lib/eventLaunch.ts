export type EventLaunchEssentials = { ceremonyDate?: string | null; venue?: string | null; gates?: string | null };

export function getEventLaunchReadiness(event: EventLaunchEssentials, guestCount: number) {
  const items = [
    { key: "details", done: Boolean(event.ceremonyDate && event.venue) },
    { key: "guests", done: guestCount > 0 },
    { key: "gates", done: Boolean(event.gates?.trim()) },
  ];
  return { items, readyCount: items.filter((item) => item.done).length, totalCount: items.length };
}
