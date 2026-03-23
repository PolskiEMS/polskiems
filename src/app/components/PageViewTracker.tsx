"use client";

import { useEffect, useRef } from "react";

const VIEW_INTERVAL_MS = 30 * 60 * 1000;

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
  const hasSent = useRef(false);

  useEffect(() => {
    if (hasSent.current) return;
    hasSent.current = true;

    try {
      const now = Date.now();
      const throttleKey = `polskiems_${page}_last_view`;
      const lastView = Number(localStorage.getItem(throttleKey) || "0");

      if (now - lastView < VIEW_INTERVAL_MS) {
        return;
      }

      const visitorId = getVisitorId();

      fetch("/api/pageView", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page,
          visitorId,
        }),
      })
        .then(() => {
          localStorage.setItem(throttleKey, String(now));
        })
        .catch(() => {});
    } catch {}
  }, [page]);

  return null;
}