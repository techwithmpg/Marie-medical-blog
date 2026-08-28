"use client";

import { Analytics } from "@vercel/analytics/next";
import { sanitizeAnalyticsEvent } from "@/lib/analytics-privacy";

export function PrivacySafeAnalytics() {
  return <Analytics beforeSend={sanitizeAnalyticsEvent} />;
}
