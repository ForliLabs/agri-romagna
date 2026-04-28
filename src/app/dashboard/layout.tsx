"use client";

import {
  Activity,
  BarChart3,
  Bot,
  BrainCircuit,
  CloudSun,
  Crosshair,
  Cog,
  Network,
  Dices,
  Droplets,
  FileOutput,
  Link2,
  Lock,
  Smartphone,
  Sparkles,
  Store,
  TestTubes,
  Globe,
  Handshake,
  Home,
  Leaf,
  Landmark,
  MessageSquare,
  Newspaper,
  Package,
  QrCode,
  Radio,
  Route,
  Satellite,
  ScanSearch,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Bug,
  Tractor,
  TrendingUp,
  Trees,
  Users,
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
        { label: "Forza lavoro", href: "/dashboard/workforce", icon: <Users /> },
        { label: "Assicurazione", href: "/dashboard/insurance", icon: <Shield /> },
        { label: "Salute suolo", href: "/dashboard/soil-health", icon: <Globe /> },
        { label: "Commerciale", href: "/dashboard/commercial", icon: <Handshake /> },
        { label: "Radar normativo", href: "/dashboard/regulatory", icon: <Newspaper /> },
        { label: "Spray optimizer", href: "/dashboard/spray-optimizer", icon: <Crosshair /> },
        { label: "Attrezzature", href: "/dashboard/equipment", icon: <Cog /> },
        { label: "Comunicazione", href: "/dashboard/communication", icon: <MessageSquare /> },
        { label: "ESG & Impatto", href: "/dashboard/esg", icon: <Leaf /> },
        { label: "Simulatore", href: "/dashboard/simulator", icon: <Dices /> },
        { label: "Accessi & Ruoli", href: "/dashboard/rbac", icon: <Lock /> },
        { label: "Test & CI/CD", href: "/dashboard/test-harness", icon: <TestTubes /> },
        { label: "Insight Engine", href: "/dashboard/insights", icon: <Sparkles /> },
        { label: "Mobile campo", href: "/dashboard/mobile", icon: <Smartphone /> },
        { label: "Data Marketplace", href: "/dashboard/data-marketplace", icon: <Store /> },
        { label: "Catena conformità", href: "/dashboard/compliance-chain", icon: <Link2 /> },
        { label: "Knowledge Graph", href: "/dashboard/knowledge-graph", icon: <BrainCircuit /> },
        { label: "Anomalie & previsioni", href: "/dashboard/anomaly-detection", icon: <ScanSearch /> },
        { label: "Federazione", href: "/dashboard/federation", icon: <Network /> },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
