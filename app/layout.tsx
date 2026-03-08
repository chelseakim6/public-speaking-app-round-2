import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sono — Premium Public Speaking Coach",
  description: "Practice public speaking with AI-guided scenarios, real-time coaching tips, and a built-in teleprompter. Find your voice with Sono.",
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
