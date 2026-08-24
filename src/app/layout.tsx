import type { Metadata } from "next";
import { Newsreader, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-source-sans-3",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marie Medere — Medical Writing Portfolio & Educational Blog",
  description:
    "Evidence-based medical writing, health communication, and clinical education.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${sourceSans3.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-[#7B3F35]/15 selection:text-[#242321]">
        {children}
      </body>
    </html>
  );
}
