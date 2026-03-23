"use client";

import { useEffect } from "react";

const VIEW_INTERVAL_MS = 30 * 60 * 1000; // 30 minut
const STORAGE_KEY = "polskiems_home_last_view";

export default function TrackHomeView() {
  useEffect(() => {
    try {
      const now = Date.now();
      const lastView = Number(localStorage.getItem(STORAGE_KEY) || "0");

      if (now - lastView < VIEW_INTERVAL_MS) {
        return;
      }

      fetch("/api/pageView", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page: "home" }),
      })
        .then(() => {
          localStorage.setItem(STORAGE_KEY, String(now));
        })
        .catch(() => {});
    } catch {
      // nic nie rób
    }
  }, []);

  return null;
}