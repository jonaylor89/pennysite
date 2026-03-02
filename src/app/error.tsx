"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
        Something went wrong
      </h2>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        An error occurred while loading this page. Our team has been notified.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          padding: "0.5rem 1.25rem",
          backgroundColor: "#09090b",
          color: "#fff",
          border: "none",
          borderRadius: "0.5rem",
          cursor: "pointer",
          fontSize: "0.875rem",
        }}
      >
        Try again
      </button>
    </div>
  );
}
