'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/main-layout';
import t from '@/lib/i18n';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Container,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input
} from '@/components/ui';
import { useState } from 'react';
import { signIn } from "next-auth/react";

// Simple validation schema for login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setError(null);
    console.log(data);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.ok) {
        alert('Successfully logged in!');
        // Redirect to home page or previous page
        window.location.href = '/';
      } else {
        setError(result?.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error); 
      setError('An error occurred during login. Please try again.');
    }
  }

  return (
    <MainLayout>
      <Container className="py-12 md:py-20">
        <div className="mx-auto flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-white bg-red-500 rounded">
                      {error}
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@domain.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <div className="text-sm text-muted-foreground">
                <Link href="/reset-password" className="text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </Container>
    </MainLayout>
  );
} 