import type { Metadata } from "next";
import SeoPageTemplateA from "../components/SeoPages/SeoPageTemplateA";
import { seoPagesData } from "../seo-pages-data";

const pageData = seoPagesData["produkcja-pcb-polska"];

export const metadata: Metadata = {
  title: "Produkcja PCB w Polsce | Producenci EMS | PolskiEMS",
  description:
    "Porównaj firmy oferujące produkcję PCB w Polsce. Sprawdź dostawców EMS, ich możliwości technologiczne i wybierz partnera do prototypów lub serii.",
};

export default function ProdukcjapcbpolskaPage() {
  return <SeoPageTemplateA data={pageData} />;
}
