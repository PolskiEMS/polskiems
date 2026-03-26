"use client";

import { useEffect, useRef } from "react";

const VIEW_INTERVAL_MS = 30 * 60 * 1000; // 30 min throttle per page

function getVisitorId() {
  const key = "polskiems_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export default function PageViewTracker({ page }: { page: string }) {
  const pageRef = useRef(page); // Zapisz page per instancja

  useEffect(() => {
    const visitorId = getVisitorId();
    const now = Date.now();
    const throttleKey = `polskiems_${pageRef.current}_last_view`;
    const lastView = Number(localStorage.getItem(throttleKey) || "0");

    console.log(`[Tracker] Page: ${pageRef.current}, Visitor: ${visitorId.slice(0,8)}..., Last: ${new Date(lastView).toLocaleTimeString()}, Eligible: ${now - lastView >= VIEW_INTERVAL_MS}`);

    if (now - lastView < VIEW_INTERVAL_MS) {
      console.log("[Tracker] Skipped - throttled");
      return;
    }

    fetch("/api/pageView", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: pageRef.current,
        visitorId,
        timestamp: now,
        userAgent: navigator.userAgent,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        localStorage.setItem(throttleKey, String(now));
        console.log("[Tracker] Sent OK");
      })
      .catch((error) => {
        console.error("[Tracker] Failed:", error);
      });
  }, []); // Uruchom tylko raz per mount komponentu

  return null;
}
