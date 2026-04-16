"use client";

import { useEffect, useRef } from "react";

const VIEW_INTERVAL_MS = 30 * 60 * 1000; // 30 min throttle per page
const VISITOR_ID_KEY = "polskiems_visitor_id";

function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export default function PageViewTracker({ page }: { page: string }) {
  const pageRef = useRef(page); // Zapisz page per instancja

  useEffect(() => {
    const now = Date.now();
    const throttleKey = `polskiems_${pageRef.current}_last_view`;
    const visitorId = getVisitorId();
    let lastView = 0;

    try {
      lastView = Number(localStorage.getItem(throttleKey) || "0");
    } catch {
      lastView = 0;
    }

    if (now - lastView < VIEW_INTERVAL_MS) {
      return;
    }

    fetch("/api/pageView", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        page: pageRef.current,
        visitorId,
        referrer:
          typeof document !== "undefined" && document.referrer
            ? document.referrer
            : null,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return;
        }
        try {
          localStorage.setItem(throttleKey, String(now));
        } catch {
          // Brak localStorage (np. privacy mode) — pomijamy throttle w pamięci przeglądarki.
        }
      })
      .catch((error) => {
        console.error("[Tracker] Failed:", error);
      });
  }, []); // Uruchom tylko raz per mount komponentu

  return null;
}
