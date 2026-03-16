"use client";

import { useEffect } from "react";

export default function TrackHomeView() {
  useEffect(() => {
    fetch("/api/pageView", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page: "home",
      }),
    }).catch(() => {});
  }, []);

  return null;
}