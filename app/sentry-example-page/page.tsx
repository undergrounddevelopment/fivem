"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

export default function SentryExamplePage() {
  const [hasSentError, setHasSentError] = useState(false);

  useEffect(() => {
    Sentry.logger.info("Sentry example page loaded");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold">Sentry Test Page</h1>
        <p className="text-muted-foreground">
          Click the button to test Sentry error reporting
        </p>
        <button
          onClick={() => {
            setHasSentError(true);
            throw new Error("Test error for Sentry");
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Throw Test Error
        </button>
        {hasSentError && (
          <p className="text-green-600">Error sent to Sentry!</p>
        )}
      </div>
    </div>
  );
}