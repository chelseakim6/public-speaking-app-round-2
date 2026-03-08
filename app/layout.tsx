import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sono — Premium Public Speaking Coach",
  description: "Practice public speaking with AI-guided scenarios, real-time coaching tips, and a built-in teleprompter. Find your voice.",
  openGraph: {
    title: "Sono — Premium Public Speaking Coach",
    description: "Practice public speaking with AI-guided scenarios, real-time coaching tips, and a built-in teleprompter.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={playfair.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
