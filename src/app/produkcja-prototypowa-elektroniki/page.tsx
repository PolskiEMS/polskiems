import type { Metadata } from "next";
import SeoPageTemplateB from "../components/SeoPages/SeoPageTemplateB";
import { seoPagesData } from "../seo-pages-data";

const pageData = seoPagesData["produkcja-prototypowa-elektroniki"];

export const metadata: Metadata = {
  title: "Produkcja prototypowa elektroniki | Szybkie wdrożenia EMS | PolskiEMS",
  description:
    "Produkcja prototypowa elektroniki w Polsce: porównaj firmy EMS, które wspierają szybkie iteracje, walidację projektu i przejście do produkcji seryjnej.",
};

export default function ProdukcjaPrototypowaElektronikiPage() {
  return <SeoPageTemplateB data={pageData} />;
}
