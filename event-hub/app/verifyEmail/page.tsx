"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CircleX, SquareCheckBig } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [verified, setVerified] = React.useState(false);
  const [error, setError] = React.useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const id = searchParams.get("id");

  const initialized = React.useRef(false);

  // Verification effect
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      verifyEmail();
    }
  }, []);

  const verifyEmail = async () => {
    if (!token || !id) {
      setError(true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/auth/verifyEmail?token=${token}&id=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        setVerified(true);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-4">
        <div className="mt-20">
          <Alert>
            <AlertTitle>Verifying your email</AlertTitle>
            <AlertDescription>
              Please wait while we verify your email address...
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <div className="mt-20 w-full max-w-md mx-auto space-y-4">
        {verified && (
          <Alert variant="default" className="mb-5 border-green-200 bg-green-50">
            <SquareCheckBig className="h-5 w-5 text-green-600" />
            <AlertTitle>Email Verified!</AlertTitle>
            <AlertDescription>
              Your email has been verified successfully. You can now log in to your account.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-5">
            <CircleX className="h-5 w-5" />
            <AlertTitle>Email Verification Failed</AlertTitle>
            <AlertDescription>
              Your verification token is invalid or has expired. Please check your email and try again.
            </AlertDescription>
          </Alert>
        )}

        {(verified || error) && (
          <div className="flex justify-center">
            <Button 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}