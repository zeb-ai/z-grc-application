"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { generateBreadcrumbs } from "@/lib/breadcrumbs";
import type { User } from "@/types/auth";

// Simple in-memory cache for user session
let userCache: { user: User | null; timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 seconds

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      // Check if we already fetched in this component instance
      if (fetchedRef.current) return;

      // Check cache first
      if (userCache && Date.now() - userCache.timestamp < CACHE_DURATION) {
        setUser(userCache.user);
        setLoading(false);
        fetchedRef.current = true;
        return;
      }

      try {
        const res = await fetch("/api/auth/me");

        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          const userData = data.user;
          setUser(userData);
          // Update cache
          userCache = { user: userData, timestamp: Date.now() };
        } else {
          router.push("/");
          return;
        }
      } catch {
        if (isMounted) {
          router.push("/");
          return;
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          fetchedRef.current = true;
        }
      }
    }

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency - only fetch once on mount

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar user={user || undefined} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-4 flex-1">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.href} className="flex items-center gap-2">
                      {index > 0 && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                      <BreadcrumbItem className="hidden md:block">
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.href}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
