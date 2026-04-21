import type { Metadata } from "next";
import SeoPageTemplateB from "../components/SeoPages/SeoPageTemplateB";
import { seoPagesData } from "../seo-pages-data";

const pageData = seoPagesData["montaz-elektroniki-w-polsce"];

export const metadata: Metadata = {
  title: "Montaż elektroniki w Polsce | Katalog EMS B2B | PolskiEMS",
  description:
    "Znajdź partnera do montażu elektroniki w Polsce. Porównaj firmy EMS oferujące montaż, testy i wsparcie wdrożenia od prototypu po produkcję seryjną.",
};

export default function MontazElektronikiPolskaPage() {
  return <SeoPageTemplateB data={pageData} />;
}
