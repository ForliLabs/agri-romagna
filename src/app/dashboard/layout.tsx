"use client";

import {
  Activity,
  BarChart3,
  Bot,
  CloudSun,
  Droplets,
  FileOutput,
  Home,
  Leaf,
  Landmark,
  Package,
  QrCode,
  Radio,
  Route,
  Satellite,
  ShieldCheck,
  ShoppingBag,
  Bug,
  Tractor,
  TrendingUp,
  Trees,
  UsersRound,
  Wallet,
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
        { label: "Intelligenza", href: "/dashboard/intelligence", icon: <Activity /> },
        { label: "Filiera", href: "/dashboard/supply-chain", icon: <Package /> },
        { label: "Previsioni resa", href: "/dashboard/yield-prediction", icon: <TrendingUp /> },
        { label: "Carbonio", href: "/dashboard/carbon", icon: <Leaf /> },
        { label: "Finanza", href: "/dashboard/financial", icon: <Wallet /> },
        { label: "Allerta fitosanitaria", href: "/dashboard/pest-warning", icon: <Bug /> },
        { label: "Governance", href: "/dashboard/governance", icon: <Landmark /> },
        { label: "Gestione idrica", href: "/dashboard/water", icon: <Droplets /> },
        { label: "Benchmarking", href: "/dashboard/benchmarking", icon: <BarChart3 /> },
        { label: "Interoperabilità", href: "/dashboard/interoperability", icon: <FileOutput /> },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
