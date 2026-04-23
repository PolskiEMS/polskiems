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
  title: "Wyszukiwarka Producentów Elektroniki | Twoja Baza EMS",
  description:
    "Szybko znajdź producenta elektroniki w Polsce z odpowiednim zakresem usług, skalą produkcji i lokalizacją. Filtruj według regionu, wymagań i skali.",
  keywords: [
    "producent elektroniki",
    "EMS Polska",
    "montaż SMD",
    "PCB montaż",
    "produkcja PCB",
    "montaż SMT",
    "katolog producentów elektroniki",
    "wyszukiwarka producentów",
    "produkcja elektroniki",
    "outsourcing produkcji",
    "baza producentów PCB",
    "filtr producentów elektroniki",
  ],
  openGraph: {
    title: "Wyszukiwarka Producentów Elektroniki | Twoja Baza EMS",
    description:
      "Znajdź idealnego partnera do produkcji elektroniki w Polsce. Intuicyjna wyszukiwarka producentów PCB i EMS.",
    url: "https://polskiems.pl",
    siteName: "Wyszukiwarka Producentów",
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
    title: "Wyszukiwarka Producentów Elektroniki",
    description: "Znajdź producenta elektroniki dopasowanego do Twoich potrzeb.",
    images: ["/images/logo.png"],
  },
  metadataBase: new URL("https://polskiems.pl"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
