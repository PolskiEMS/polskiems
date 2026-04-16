import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import Footer from "./components/Footer/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wyszukiwarka Producentów Elektroniki | Twoja Baza EMS",
  description: "Szybko znajdź producenta elektroniki w Polsce z odpowiednim zakresem usług, skalą produkcji i lokalizacją. Filtruj według regionu, wymagań i skali.",
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
    "filtr producentów elektroniki"
  ],
  openGraph: {
    title: "Wyszukiwarka Producentów Elektroniki | Twoja Baza EMS",
    description: "Znajdź idealnego partnera do produkcji elektroniki w Polsce. Intuicyjna wyszukiwarka producentów PCB i EMS.",
    url: "https://polskiems.pl",
    siteName: "Wyszukiwarka Producentów",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Wyszukiwarka Producentów Elektroniki"
      }
    ],
    locale: "pl_PL",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Wyszukiwarka Producentów Elektroniki",
    description: "Znajdź producenta elektroniki dopasowanego do Twoich potrzeb.",
    images: ["/images/logo.png"]
  },
  // metadataBase: new URL("https://twoja-strona.pl")
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div style={{width: '160px'}}>
          <Link style={{ cursor: 'pointer', }} href={'/'}><Image src={'/images/logo.png'} alt="Polski EMS - znajdź swojego producenta" width={150} height={150} /></Link>
        </div>
        {children}
        <Footer />
      </body>
    </html>
  );
}
