import type { Metadata } from "next";
import SeoPageTemplateA from "../components/SeoPages/SeoPageTemplateA";
import { seoPagesData } from "../seo-pages-data";

const pageData = seoPagesData["montaz-tht-polska"];

export const metadata: Metadata = {
  title: "Montaż THT w Polsce | Producenci elektroniki | PolskiEMS",
  description:
    "Szukasz montażu THT w Polsce? Sprawdź producentów EMS, porównaj kompetencje technologiczne i wybierz partnera do projektów wymagających trwałych połączeń.",
};

export default function MontazthtpolskaPage() {
  return <SeoPageTemplateA data={pageData} />;
}
