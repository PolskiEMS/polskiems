export const SERVICES = [
  "Projekt",
  "Dostarcza PCB",
  "Kupuje komponenty",
  "Montaż SMD",
  "Montaż THT",
  "Inspekcja",
  "Test Flying Probe",
  "Test funkcjonalny",
  "Montaż obudowe",
  "Montaż produktu finalnego",
  "Conformal Coating",
  "Mycie płytek",
  "Lakierowanie",
  "Hermetyzacja",
  "IPC Klasa 3",
  "IPC Klasa 2",
  "IPC Klasa 1",
  "Umożliwia audyt",
] as const;

export type ServiceName = (typeof SERVICES)[number];
