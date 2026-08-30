export function buildAlaqeeqKeyPaths(eventId?: number | null) {
  const hasEvent = typeof eventId === "number" && Number.isFinite(eventId) && eventId > 0;
  const workspace = hasEvent ? `/workspace/${eventId}` : "/dashboard?tab=events";
  return {
    workspace,
    guests: hasEvent ? `${workspace}?tab=guests` : "/dashboard?tab=events",
    invitation: hasEvent ? `${workspace}?tab=invitation` : "/dashboard?tab=events",
    command: hasEvent ? `${workspace}?tab=command` : "/scan",
    reports: hasEvent ? `${workspace}?tab=reports` : "/dashboard?tab=events",
    maison: hasEvent ? `${workspace}?tab=maison` : "/maison",
    memories: hasEvent ? `/event/${eventId}/memories` : "/maison",
  };
}
