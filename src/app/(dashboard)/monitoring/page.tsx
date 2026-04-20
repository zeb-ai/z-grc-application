"use client";

import { FileText, BarChart3, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MonitoringCard {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  disabled?: boolean;
}

const monitoringCards: MonitoringCard[] = [
  {
    title: "Logs",
    description:
      "View and search through system logs, errors, and application events in real-time",
    icon: FileText,
    href: "/monitoring/logs",
    badgeVariant: "secondary",
    disabled: false,
  },
  {
    title: "Metrics",
    description:
      "Monitor performance metrics, resource usage, and system health indicators",
    icon: BarChart3,
    href: "/monitoring/metrics",
    badgeVariant: "secondary",
    disabled: false,
  },
  {
    title: "Telemetry",
    description:
      "Track distributed traces, spans, and end-to-end request flows across services",
    icon: Activity,
    href: "/monitoring/telemetry",
    badgeVariant: "secondary",
    disabled: false,
  },
];

interface MonitoringCardItemProps {
  card: MonitoringCard;
  onClick: () => void;
}

function MonitoringCardItem({ card, onClick }: MonitoringCardItemProps) {
  const Icon = card.icon;

  return (
    <Card
      className={`transition-all ${
        card.disabled
          ? "opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:shadow-lg hover:border-primary/50"
      }`}
      onClick={!card.disabled ? onClick : undefined}
    >
      <CardHeader className="space-y-0 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl font-semibold">{card.title}</CardTitle>
        </div>
        <CardDescription className="text-sm leading-relaxed">
          {card.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function MonitoringPage() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight">Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor system performance, logs, and telemetry in real-time
        </p>
      </div>

      {/* Monitoring Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {monitoringCards.map((card) => (
          <MonitoringCardItem
            key={card.title}
            card={card}
            onClick={() => router.push(card.href)}
          />
        ))}
      </div>
    </div>
  );
}
