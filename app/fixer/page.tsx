"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Force dynamic rendering to avoid SSG issues with auth
export const dynamic_config = 'force-dynamic';

function FixerPageContent() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    window.location.replace("https://fixer.boostfivem.com/");
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">🔒 Login Required</h1>
          <p className="text-muted-foreground">Please login to access FIXER V 2.5</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">🔧 Redirecting to FIXER V 2.5...</h1>
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
}

export default function FixerPage() {
  return <FixerPageContent />;
}
