// app/checkin/scanner/page.tsx
// Scanner page for event check-in using QR codes
// This page is designed to be used by staff members to check in attendees using QR codes.
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { UserRole } from "@prisma/client";

export default function ScannerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [result, setResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const scannerRef = useRef(null);
  const scannerInstance = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user.role !== UserRole.STAFF) {
      router.replace("/not-authorized");
    }
  }, [status, session, router]);

  useEffect(() => {
    return () => {
      if (scannerInstance.current) {
        try {
          scannerInstance.current.clear();
        } catch (err) {
          console.error("Error clearing scanner:", err);
        }
      }
    };
  }, []);

  useEffect(() => {
    // Only initialize after a short delay to ensure DOM is ready
    const initializeScanner = setTimeout(() => {
      if (
        status === "authenticated" &&
        session?.user.role === UserRole.STAFF &&
        showScanner &&
        !scanning
      ) {
        setErrorMessage("");
        setScanning(true);

        try {
          // Make sure the HTML element exists
          const qrReaderElement = document.getElementById("qr-reader");
          if (!qrReaderElement) {
            throw new Error("QR reader element not found");
          }

          const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              rememberLastUsedCamera: true,
              showTorchButtonIfSupported: true,
              aspectRatio: 1.0,
            },
            false
          );

          scannerInstance.current = scanner;

          scanner.render(
            async (decodedText) => {
              try {
                await scanner.clear();
              } catch (err) {
                console.error("Error clearing scanner after scan:", err);
              }

              setScanning(false);
              setShowScanner(false);
              setResult("Checking in...");

              try {
                const res = await fetch("/api/checkin", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ qrCode: decodedText }),
                });

                const data = await res.json();
                if (res.ok) {
                  setResult("✅ Check-in successful");
                } else {
                  setResult(`❌ ${data.error}`);
                }
              } catch (err) {
                setResult("❌ Network error. Please try again.");
              }
            },
            (errorMessage) => {
              console.log("QR scanning error:", errorMessage);
              // Don't show transient errors to the user
            }
          );
        } catch (err) {
          console.error("Error initializing scanner:", err);
          setErrorMessage("Failed to initialize scanner. Please try again.");
          setScanning(false);
        }
      }
    }, 1000); // Longer delay to ensure DOM is ready

    return () => clearTimeout(initializeScanner);
  }, [status, session, showScanner, scanning]);

  const restartScanner = () => {
    if (scannerInstance.current) {
      try {
        scannerInstance.current.clear();
        scannerInstance.current = null;
      } catch (err) {
        console.error("Error clearing scanner on restart:", err);
      }
    }

    // Reset all states after a small delay to allow scanner to clear
    setTimeout(() => {
      setResult(null);
      setErrorMessage("");
      setShowScanner(true);
      setScanning(false);
    }, 100);
  };

  if (status === "loading") {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="text-center py-20">
        You must be logged in to access this page.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center">
      <h1 className="text-2xl font-bold mb-6">QR Code Check-in Scanner</h1>
      
      {showScanner && (
        <div
          id="qr-reader"
          ref={scannerRef}
          className="mb-6 mx-auto border rounded shadow overflow-hidden"
          style={{ width: "100%", maxWidth: "500px", height: "auto", minHeight: "300px" }}
        />
      )}
  
      {result && <div className="text-lg font-medium mt-4">{result}</div>}
      {errorMessage && <div className="text-red-600 mt-2">{errorMessage}</div>}
  
      <div className="mt-6 flex flex-col items-center gap-4">
        <Button onClick={restartScanner}>Restart Scanner</Button>
        <Button variant="secondary" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}