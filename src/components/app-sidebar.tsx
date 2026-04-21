"use client";

import {
  BookOpenIcon,
  Home,
  PieChartIcon,
  TerminalIcon,
  KeyRound,
} from "lucide-react";
import Image from "next/image";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string;
    email: string;
  };
}

const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/home",
      icon: <Home />,
      isActive: true,
    },
    {
      title: "User Groups",
      url: "/user-groups",
      icon: <TerminalIcon />,
    },
    {
      title: "API Keys",
      url: "/api-keys",
      icon: <KeyRound />,
    },
    {
      title: "Monitoring",
      url: "/monitoring",
      icon: <PieChartIcon />,
      isActive: true,
      items: [
        {
          title: "Logs",
          url: "/monitoring/logs",
        },
        {
          title: "Metrics",
          url: "/monitoring/metrics",
        },
        {
          title: "Telemetry",
          url: "/monitoring/telemetry",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Z-GRC Package Documentation",
      url: "https://zeb-ai.github.io/z-grc/",
      icon: <BookOpenIcon />,
    },
    {
      title: "Governance Documentation",
      url: "https://zeb-ai.github.io/z-grc/",
      icon: <BookOpenIcon />,
    },
    {
      title: "Code Package Support",
      url: "/support",
      icon: <TerminalIcon />,
    },
  ],
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const userData = user || {
    name: "User",
    email: "user@example.com",
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/home">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/icon.svg"
                    alt="logo"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Governance Engine
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Visualization
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
