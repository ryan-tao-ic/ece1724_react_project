import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import t from "@/lib/i18n";
import { Button, Container } from "@/components/ui";
import { radius, spacing, text } from "@/lib/theme";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getUserRegistrations } from "@/lib/db/registration";
import { formatDate, createCalendarLink } from "@/lib/utils";
import { CalendarIcon, ExternalLinkIcon, QrCodeIcon, XCircleIcon } from "lucide-react";
import { cancelRegistrationAction } from "@/app/actions";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { upcoming, past } = await getUserRegistrations(session.user.id);

  return (
    <MainLayout>
      <Container className="py-10">
        <div className={`flex flex-col ${spacing.lg}`}>
          <div className="mb-6">
            <h1 className={`font-bold tracking-tight ${text["3xl"]}`}>
              {t("dashboard.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("dashboard.description")}
            </p>
          </div>

          <div className="mb-8">
            <h2 className={`font-semibold mb-4 ${text.xl}`}>
              {t("dashboard.upcomingEvents.title")}
            </h2>
            
            {upcoming.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((registration) => (
                  <div 
                    key={registration.id} 
                    className="border rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium truncate">{registration.event.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        registration.status === 'REGISTERED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {registration.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1 mb-4">
                      <div><strong>Date:</strong> {formatDate(registration.event.eventStartTime)}</div>
                      <div><strong>Location:</strong> {registration.event.location}</div>
                      <div><strong>Category:</strong> {registration.event.category.name}</div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${registration.event.id}`}>
                          <ExternalLinkIcon className="h-3.5 w-3.5 mr-1" />
                          Event Details
                        </Link>
                      </Button>

                      {registration.status === 'REGISTERED' && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/events/${registration.event.id}/register`}>
                            <QrCodeIcon className="h-3.5 w-3.5 mr-1" />
                            View QR Code
                          </Link>
                        </Button>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      {registration.status === 'REGISTERED' && (
                        <a 
                        href={createCalendarLink({
                          name: registration.event.name,
                          location: registration.event.location,
                          eventStartTime: registration.event.eventStartTime.toString(),
                          eventEndTime: registration.event.eventEndTime.toString()
                        })} 
                          target="_blank" 
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                          Add to Calendar
                        </a>
                      )}

                      <form action={cancelRegistrationAction}>
                        <input type="hidden" name="eventId" value={registration.event.id} />
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" type="submit">
                          <XCircleIcon className="h-3.5 w-3.5 mr-1" />
                          Cancel Registration
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`border border-dashed p-8 text-center ${radius.lg}`}>
                <h3 className={`font-medium ${text.lg}`}>
                  {t("dashboard.upcomingEvents.empty.title")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("dashboard.upcomingEvents.empty.description")}
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/events">
                    {t("dashboard.upcomingEvents.empty.action")}
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <div>
            <h2 className={`font-semibold mb-4 ${text.xl}`}>
              {t("dashboard.pastEvents.title")}
            </h2>
            
            {past.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {past.map((registration) => (
                  <div 
                    key={registration.id} 
                    className="border rounded-lg p-5 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium truncate">{registration.event.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        registration.status === 'ATTENDED' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {registration.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1 mb-4">
                      <div><strong>Date:</strong> {formatDate(registration.event.eventStartTime)}</div>
                      <div><strong>Location:</strong> {registration.event.location}</div>
                      <div><strong>Category:</strong> {registration.event.category.name}</div>
                    </div>
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/events/${registration.event.id}`}>
                        <ExternalLinkIcon className="h-3.5 w-3.5 mr-1" />
                        View Event Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`border border-dashed p-8 text-center ${radius.lg}`}>
                <h3 className={`font-medium ${text.lg}`}>
                  {t("dashboard.pastEvents.empty.title")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("dashboard.pastEvents.empty.description")}
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}