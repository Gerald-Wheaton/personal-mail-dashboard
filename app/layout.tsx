import type { Metadata } from "next";
import { Space_Grotesk, Bona_Nova } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-app-sans",
  subsets: ["latin"],
});

const bonaNova = Bona_Nova({
  variable: "--font-app-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Gmail Command Deck",
  description: "A focused Gmail dashboard for Primary + FM360",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${bonaNova.variable} antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
