export function readUrlState<T extends string>(location: string, key: string, allowed: readonly T[], fallback: T): T {
  const queryIndex = location.indexOf("?");
  const params = new URLSearchParams(queryIndex >= 0 ? location.slice(queryIndex + 1) : "");
  const value = params.get(key);
  return value && allowed.includes(value as T) ? value as T : fallback;
}

export function withUrlState(location: string, key: string, value: string): string {
  const queryIndex = location.indexOf("?");
  const path = queryIndex >= 0 ? location.slice(0, queryIndex) : location;
  const params = new URLSearchParams(queryIndex >= 0 ? location.slice(queryIndex + 1) : "");
  params.set(key, value);
  return `${path}?${params.toString()}`;
}
