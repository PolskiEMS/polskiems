const VIEW_TTL_MS = 30 * 60 * 1000; // 30 minut

function shouldTrackView(companyId: number) {
  if (typeof window === "undefined") return false;

  const key = `company_view_${companyId}`;
  const last = window.localStorage.getItem(key);
  const now = Date.now();

  if (last) {
    const diff = now - Number(last);
    if (!Number.isNaN(diff) && diff < VIEW_TTL_MS) {
      return false;
    }
  }

    window.localStorage.setItem(key, now.toString());
    return true;
}

export const trackCompanyEvent = (companyId: number, eventType: string) => {
  if (eventType === "view") {
    if (!shouldTrackView(companyId)) {
      return;
    }
  }

  const payload = JSON.stringify({
    company_id: companyId,
    event_type: eventType,
  });

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/saveStatistics", blob);
    return;
  }

  fetch("/api/saveStatistics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
};