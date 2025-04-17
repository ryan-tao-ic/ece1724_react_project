// app/events/[id]/register/page.tsx (Server Component)
// This file is a server component that handles the registration process for an event.
// It retrieves the event details, user information, and any existing registration for the user.
// If the user is not logged in, it redirects them to the login page. If the event or user is not found, it returns a 404 error.

import { getTokenForServerComponent } from '@/lib/auth/auth';
import { getEventById } from "@/lib/db/events";
import { getUserById } from "@/lib/db/users";
import { getUserRegistration } from "@/lib/db/registration";
import { notFound, redirect } from "next/navigation";
import RegisterClientForm from "./RegisterClientForm";
import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/ui/container";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { status?: string; code?: string; cancelled?: string };
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.id) redirect("/login");
  const token = await getTokenForServerComponent();
  const id = token.id;
  // const {id} = await getTokenForServerComponent();
  if (!id) {  
    redirect("/login");
  }

  // const user = await getUserById(session.user.id);
  const user = await getUserById(id);
  if (!user) return notFound();

  const event = await getEventById(resolvedParams.id);
  if (!event) return notFound();

  const registration = await getUserRegistration(event.id, user.id);

  return (
    <MainLayout>
      <Container>
        <RegisterClientForm
          user={user}
          event={event}
          registration={registration}
          searchParams={resolvedSearchParams}
        />
      </Container> 
    </MainLayout>
  );
}