"use client";

import {
  Bot,
  CloudSun,
  Home,
  QrCode,
  Radio,
  Route,
  Satellite,
  ShieldCheck,
  ShoppingBag,
  Tractor,
  Trees,
  UsersRound,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardShell
      brand="AgriRomagna"
      items={[
        { label: "Panoramica", href: "/dashboard", icon: <Home /> },
        { label: "Campi", href: "/dashboard/fields", icon: <Trees /> },
        { label: "Satellitare", href: "/dashboard/satellite", icon: <Satellite /> },
        { label: "Meteo & rischi", href: "/dashboard/weather", icon: <CloudSun /> },
        { label: "Raccolta", href: "/dashboard/harvest", icon: <Tractor /> },
        { label: "Cooperativa", href: "/dashboard/cooperative", icon: <UsersRound /> },
        { label: "Logistica", href: "/dashboard/logistics", icon: <Route /> },
        { label: "Conformità", href: "/dashboard/compliance", icon: <ShieldCheck /> },
        { label: "Tracciabilità", href: "/dashboard/traceability", icon: <QrCode /> },
        { label: "Consulente AI", href: "/dashboard/advisor", icon: <Bot /> },
        { label: "Vendita diretta", href: "/dashboard/marketplace", icon: <ShoppingBag /> },
        { label: "Sensori IoT", href: "/dashboard/iot", icon: <Radio /> },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
