'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Container } from '@/components/ui/container';
import t from '@/lib/i18n';
import { isAuthenticated, logout } from '@/lib/auth/auth';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const router = useRouter();
  // Use our simplified auth helper
  const isLoggedIn = isAuthenticated();

  const handleLogout = async () => {
    await logout();
    // In a real app, this would actually log the user out
    // For now it just redirects
    router.push('/');
  };

  return (
    <header className="border-b">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-xl">
            {t('app.name')}
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/events" className="text-sm font-medium hover:underline">
            {t('navbar.browseEvents')}
          </Link>
          <Link href="/dashboard" className="text-sm font-medium hover:underline">
            {t('navbar.dashboard')}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('navbar.myAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">{t('navbar.dashboard')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">{t('navbar.profile')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  {t('navbar.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">{t('navbar.login')}</Link>
              </Button>
              <Button asChild>
                <Link href="/register">{t('navbar.signUp')}</Link>
              </Button>
            </>
          )}
        </div>
      </Container>
    </header>
  );
} 