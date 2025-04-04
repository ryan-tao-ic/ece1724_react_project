import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import t from "@/lib/i18n";
import { Button, Container } from "@/components/ui";
import { radius, spacing, text } from "@/lib/theme";

export default function DashboardPage() {
  return (
    <MainLayout>
      <Container className="py-10">
        <div className={`flex flex-col ${spacing.lg}`}>
          <div>
            <h1 className={`font-bold tracking-tight ${text["3xl"]}`}>
              {t("dashboard.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("dashboard.description")}
            </p>
          </div>

          <div>
            <h2 className={`font-semibold mb-4 ${text.xl}`}>
              {t("dashboard.upcomingEvents.title")}
            </h2>
            <div
              className={`border border-dashed p-8 text-center ${radius.lg}`}
            >
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
          </div>

          <div>
            <h2 className={`font-semibold mb-4 ${text.xl}`}>
              {t("dashboard.pastEvents.title")}
            </h2>
            <div
              className={`border border-dashed p-8 text-center ${radius.lg}`}
            >
              <h3 className={`font-medium ${text.lg}`}>
                {t("dashboard.pastEvents.empty.title")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("dashboard.pastEvents.empty.description")}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}
