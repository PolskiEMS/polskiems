"use client";

import { useEffect } from "react";

export default function TrackHomeView() {
  useEffect(() => {
    fetch("/api/pageView", {
      method: "POST",
    });
  }, []);

  return null;
}