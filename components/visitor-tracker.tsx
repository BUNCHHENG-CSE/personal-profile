"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __trackVisitorAction?: (action: string, detail?: string) => void;
  }
}

interface VisitorTrackerProps {
  analyticsEnabled?: boolean;
}

export function VisitorTracker({ analyticsEnabled = true }: VisitorTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!analyticsEnabled) return;

    // Send pageview telemetry
    const pagePath = pathname || "/";
    const referrer = typeof document !== "undefined" ? document.referrer : "";

    // Track initial pageview
    void fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "profile_view",
        pagePath,
        referrer,
      }),
      keepalive: true,
    }).catch(() => {});

    // Provide global interaction dispatcher for components
    window.__trackVisitorAction = (action: string, detail?: string) => {
      if (!analyticsEnabled) return;
      void fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "interaction",
          pagePath,
          action,
          detail,
          referrer,
        }),
        keepalive: true,
      }).catch(() => {});
    };

    return () => {
      delete window.__trackVisitorAction;
    };
  }, [pathname, analyticsEnabled]);

  return null;
}
