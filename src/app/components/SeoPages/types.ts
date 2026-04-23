export type SeoSection = {
  heading: string;
  paragraphs: string[];
};

export type SeoInfoBox = {
  heading: string;
  text: string;
};

export type SeoPageData = {
  title: string;
  lead: string[];
  searchHref: string;
  mainSections: SeoSection[];
  infoBoxes?: SeoInfoBox[];
};
