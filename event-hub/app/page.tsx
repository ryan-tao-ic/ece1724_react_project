// app/page.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/ui/container";
import t from "@/lib/i18n";

export default async function HomePage() {
  return (
    <MainLayout>
      <section className="w-full py-12 md:py-20 lg:py-24">
        <Container className="flex flex-col items-center justify-center gap-4 text-center mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {t("home.hero.title")} <br />
            <span className="text-primary">
              {t("home.hero.titleHighlight")}
            </span>
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            {t("home.hero.description")}
          </p>
          <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
            <Button size="lg" asChild>
              <Link href="/events">{t("home.cta.browseEvents")}</Link>
            </Button>
          </div>
        </Container>
      </section>

      <section className="w-full py-8 md:py-12 lg:py-16">
        <Container>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">
                {t("home.features.eventManagement.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("home.features.eventManagement.description")}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M17 8h5l-5 10H6" />
                  <path d="M8 6h10l-5 10H2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">
                {t("home.features.qrCode.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("home.features.qrCode.description")}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M3 8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                  <path d="M11 16a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z" />
                  <path d="M8 7h8" />
                  <path d="M8 11h8" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">
                {t("home.features.realTime.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("home.features.realTime.description")}
              </p>
            </div>
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}
