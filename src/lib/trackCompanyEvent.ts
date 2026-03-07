export const trackCompanyEvent = (companyId: number, eventType: string) => {
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