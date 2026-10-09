export async function post<T>(url: string, value: unknown = {}): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error || "Something went wrong. Please try again.");
  return data as T;
}

export function scrollToAppTop() {
  document
    .getElementById("app-viewport")
    ?.scrollTo({ top: 0, behavior: "instant" });
  window.scrollTo({ top: 0, behavior: "instant" });
}
