// ✅ app/events/[id]/register/page.tsx (Server Component)

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getEventById } from "@/lib/db/events";
import { getUserById } from "@/lib/db/users";
import { getUserRegistration } from "@/lib/db/registration";
import { notFound, redirect } from "next/navigation";
import RegisterClientForm from "./RegisterClientForm";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { status?: string; code?: string; cancelled?: string };
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await getUserById(session.user.id);
  if (!user) return notFound();

  const event = await getEventById(resolvedParams.id);
  if (!event) return notFound();

  const registration = await getUserRegistration(event.id, user.id);

  return (
    <RegisterClientForm
      user={user}
      event={event}
      registration={registration}
      searchParams={resolvedSearchParams}
    />
  );
}