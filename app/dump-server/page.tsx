"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

import { Lock, Database } from "lucide-react";

export default function DumpServerPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    window.location.replace("http://168.110.211.50:5000/");
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Lock className="h-8 w-8 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>
          <p className="text-muted-foreground">Please login to access Dump Server</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Database className="h-8 w-8 mx-auto mb-4 text-primary animate-pulse" />
        <h1 className="text-2xl font-bold mb-4">Redirecting to Dump Server...</h1>
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
}
