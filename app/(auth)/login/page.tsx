// /app/(auth)/login/page.tsx
// This file implements the login page for a Next.js app using NextAuth for authentication.
// It renders a form where users input email and password, performs client-side validation,
// and calls NextAuth's `signIn` with "credentials" provider.

"use client";

import { MainLayout } from "@/components/layout/main-layout";

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
    Input,
} from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Simple validation schema for login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.ok) {
        setLoginSuccess(true);
        toast.success("Successfully logged in!", {
          description: "Welcome back! Redirecting to dashboard...",
        });
        
        // Brief delay for the toast to be visible before redirect
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        // Check if the error is related to account activation
        if (result?.error?.includes("Account not activated")) {
          toast.error("Account not activated", {
            description: "Please check your email for the activation link."
          });
        } else {
          toast.error("Login failed", {
            description: result?.error || "Please check your credentials and try again."
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login error", {
        description: "An unexpected error occurred. Please try again later."
      });
    } finally {
      if (!loginSuccess) {
        setIsLoading(false);
      }
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
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className={`space-y-4 ${loginSuccess ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@domain.com" {...field} disabled={isLoading || loginSuccess} />
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
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading || loginSuccess}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading || loginSuccess}
                  >
                    {loginSuccess ? "Logged in successfully!" : isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className={`flex flex-col items-center ${loginSuccess ? 'opacity-60 pointer-events-none' : ''}`}>
              <div className="text-sm text-muted-foreground">
                <Button
                  variant="link"
                  className="text-primary hover:underline font-medium p-0 cursor-pointer"
                  onClick={async () => {
                    const email = form.getValues("email");
                    if (!email) {
                      toast.error("Email required", {
                        description: "Please enter your email address first"
                      });
                      return;
                    }

                    try {
                      const response = await fetch("/api/auth/forgotPassword", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email }),
                      });

                      if (response.ok) {
                        toast.success("Password reset requested", {
                          description: "We've sent a password reset link to your email. Please check your inbox."
                        });
                      } else {
                        const data = await response.json();
                        throw new Error(
                          data.message || "Failed to send reset email"
                        );
                      }
                    } catch (error) {
                      toast.error("Reset request failed", {
                        description: error instanceof Error
                          ? error.message
                          : "Failed to send reset email"
                      });
                    }
                  }}
                  disabled={isLoading || loginSuccess}
                >
                  Forgot your password?
                </Button>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-primary hover:underline cursor-pointer"
                >
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
