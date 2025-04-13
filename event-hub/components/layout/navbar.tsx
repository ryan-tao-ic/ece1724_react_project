"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import t from "@/lib/i18n";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <header className="border-b">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-xl">
            {t("app.name")}
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/events" className="text-sm font-medium hover:underline">
            {t("navbar.browseEvents")}
          </Link>
          {session?.user?.role === "STAFF" && (
            <Link href="/roleManagement" className="text-sm font-medium hover:underline">
              Role Management
            </Link>
          )}
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:underline"
          >
            {t("navbar.dashboard")}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-2">
              {session.user?.role === "STAFF" && (
                <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-lg">
                  STAFF
                </span>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar>
                      <AvatarImage
                        // src={session?.user?.image || undefined}
                        alt={`${session?.user?.firstName || ""} ${session?.user?.lastName || ""}`.trim() || "User avatar"}
                      />
                      <AvatarFallback>
                        <svg
                          className="size-4 text-muted-foreground"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="8" r="5" />
                          <path d="M20 21a8 8 0 1 0-16 0" />
                        </svg>
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("navbar.myAccount")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">{t("navbar.dashboard")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">{t("navbar.profile")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    {t("navbar.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">{t("navbar.login")}</Link>
              </Button>
              <Button asChild>
                <Link href="/register">{t("navbar.signUp")}</Link>
              </Button>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
