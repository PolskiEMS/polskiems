import type { Metadata } from "next";
import SeoPageTemplateB from "../components/SeoPages/SeoPageTemplateB";
import { seoPagesData } from "../seo-pages-data";

const pageData = seoPagesData["kontraktowy-montaz-elektroniki"];

export const metadata: Metadata = {
  title: "Kontraktowy montaż elektroniki | Współpraca EMS | PolskiEMS",
  description:
    "Sprawdź, jak działa kontraktowy montaż elektroniki i porównaj firmy EMS w Polsce. Wybierz partnera do stabilnej, skalowalnej produkcji B2B.",
};

export default function KontraktowyMontazElektronikiPage() {
  return <SeoPageTemplateB data={pageData} />;
}
