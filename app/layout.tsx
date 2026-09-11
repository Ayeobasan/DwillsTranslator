import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dwill Translate | English ↔ Français Real-Time Voice Interpreter",
  description: "Instantaneous conversational English to French voice interpreter app.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-zinc-950 text-white font-sans">
        {children}
      </body>
    </html>
  );
}
