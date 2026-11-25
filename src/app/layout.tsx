import type { Metadata, Viewport } from "next";
import "@fontsource-variable/readex-pro";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Voix du Mécanicien | صوت الميكانيكي — Synergia",
  description:
    "Faites entendre votre voix pour les prochaines formations Synergia. خلّي صوتك يساهم في تكوينات Synergia الجاية.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#14283D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
