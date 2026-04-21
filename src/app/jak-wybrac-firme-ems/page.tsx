import type { Metadata } from "next";
import SeoPageTemplateB from "../components/SeoPages/SeoPageTemplateB";
import { seoPagesData } from "../seo-pages-data";

const pageData = seoPagesData["jak-wybrac-firme-ems"];

export const metadata: Metadata = {
  title: "Jak wybrać firmę EMS? Praktyczny przewodnik B2B | PolskiEMS",
  description:
    "Dowiedz się, jak wybrać firmę EMS do projektu elektronicznego. Poznaj kryteria oceny dostawców, checklistę wyboru i dobre praktyki współpracy.",
};

export default function JakWybracFirmeEmsPage() {
  return <SeoPageTemplateB data={pageData} />;
}
