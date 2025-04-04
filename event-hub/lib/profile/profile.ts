
export const getProfile = async () => {
  const res = await fetch("/api/profile", {
    method: "GET"});
    if (!res.ok) { 
        throw new Error("Failed to fetch profile");
    }
    return res.json();
}

