import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpeakUp — Premium Public Speaking Coach",
  description: "Practice public speaking with AI-guided scenarios, real-time coaching tips, and a built-in teleprompter. Level up your confidence.",
  openGraph: {
    title: "SpeakUp — Premium Public Speaking Coach",
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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
