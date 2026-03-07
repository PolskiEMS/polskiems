export const trackCompanyEvent = (companyId: number, eventType: string) => {
  fetch("/api/saveStatistics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company_id: companyId,
      event_type: eventType,
    }),
  });
};