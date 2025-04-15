// app/components/layout/footer.tsx

import Link from "next/link";
import { Container } from "@/components/ui/container";
import t from "@/lib/i18n";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <Container className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/contact"
            className="text-sm text-muted-foreground hover:underline"
          >
            {t("footer.contact")}
          </Link>
        </div>
      </Container>
    </footer>
  );
}
