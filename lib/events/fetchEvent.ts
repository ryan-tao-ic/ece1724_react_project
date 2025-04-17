export async function fetchEventName(id: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/events/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.name;
  } catch (err) {
    console.error("Failed to fetch event:", err);
    return null;
  }
}
