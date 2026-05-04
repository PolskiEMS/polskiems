import type { Metadata } from "next";
import localFont from "next/font/local";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import "./globals.css";

const geistSans = localFont({
  src: [
    {
      path: "../../public/fonts/Roboto-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Roboto-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "../../public/fonts/Roboto-Regular.ttf",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://polskiems.pl"),
  title: {
    default: "PolskiEMS | Wyszukiwarka producentów elektroniki i firm EMS w Polsce",
    template: "%s | PolskiEMS",
  },
  description:
    "Znajdź producentów elektroniki, firmy EMS, montaż SMD, THT, PCB i kontraktową produkcję elektroniki w Polsce.",
  keywords: [
    "PolskiEMS",
    "EMS Polska",
    "firmy EMS",
    "katalog firm EMS",
    "producent elektroniki",
    "producenci elektroniki Polska",
    "produkcja elektroniki Polska",
    "kontraktowa produkcja elektroniki",
    "montaż elektroniki",
    "montaż SMD",
    "montaż SMT",
    "montaż THT",
    "produkcja PCB",
    "montaż PCB",
    "dostawcy EMS",
    "outsourcing produkcji elektroniki",
    "wyszukiwarka producentów elektroniki",
  ],
  alternates: {
    canonical: "https://polskiems.pl",
  },
  openGraph: {
    title: "PolskiEMS | Wyszukiwarka producentów elektroniki i firm EMS w Polsce",
    description:
      "Znajdź idealnego partnera do produkcji elektroniki w Polsce. Intuicyjna wyszukiwarka producentów PCB i EMS.",
    url: "https://polskiems.pl",
    siteName: "PolskiEMS",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Wyszukiwarka Producentów Elektroniki",
      },
    ],
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PolskiEMS | Wyszukiwarka producentów elektroniki",
    description: "Znajdź firmę EMS lub producenta elektroniki w Polsce według usług, województwa i skali produkcji",
    images: ["/images/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl-PL">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
