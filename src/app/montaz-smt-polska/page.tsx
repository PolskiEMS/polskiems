import type { Metadata } from "next";
import SeoPageTemplateA from "../components/SeoPages/SeoPageTemplateA";
import { seoPagesData } from "../seo-pages-data";

const pageData = seoPagesData["montaz-smt-polska"];

export const metadata: Metadata = {
  title: "Montaż SMT w Polsce | Firmy EMS | PolskiEMS",
  description:
    "Znajdź firmy realizujące montaż SMT w Polsce. Porównaj partnerów EMS pod kątem jakości, terminów i dopasowania do skali Twojego projektu.",
};

export default function MontazsmtpolskaPage() {
  return <SeoPageTemplateA data={pageData} />;
}
