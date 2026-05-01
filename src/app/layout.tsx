import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/sw-register";
import { ToastProvider } from "@/components/toast-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AgriRomagna",
    template: "%s | AgriRomagna",
  },
  description:
    "La piattaforma digitale per cooperative e aziende agricole romagnole: campi, meteo, raccolta, logistica e vendita diretta in un unico flusso.",
  keywords: [
    "agricoltura digitale",
    "Romagna",
    "cooperativa agricola",
    "Forlì",
    "Bertinoro",
    "gestione raccolta",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AgriRomagna",
  },
  openGraph: {
    title: "AgriRomagna",
    description:
      "La spina dorsale digitale per le aziende agricole romagnole.",
    locale: "it_IT",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#193524",
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
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground selection:bg-emerald-200 selection:text-emerald-950">
        <a
          href="#main-content"
          className="skip-link fixed left-4 top-4 z-[110] -translate-y-20 rounded-full bg-emerald-950 px-4 py-2 text-sm font-semibold text-white shadow-lg transition focus:translate-y-0"
        >
          Vai al contenuto principale
        </a>
        <ToastProvider>
          <ServiceWorkerRegistration />
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
