"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import dashboardLogo from "@/public/gat-logos/dashboard-logo.webp";
import {
  LayoutDashboard,
  CalendarDays,
  HandCoins,
} from "lucide-react";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function CoordinatorShell({
  userName,
  userEmail,
  events,
  isGlobalScope,
  children,
}: {
  userName: string;
  userEmail: string;
  events: { id: string; name: string }[];
  isGlobalScope: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/coordinator">
                  <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg">
                    <Image
                      src={dashboardLogo}
                      alt="Innovate Ignite"
                      width={32}
                      height={32}
                      className="size-8 object-contain"
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Event Hub</span>
                    <span className="truncate text-xs">
                      {isGlobalScope ? "Coordinator" : "My events"}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/coordinator"}
                    tooltip="All my events"
                  >
                    <Link href="/coordinator">
                      <LayoutDashboard />
                      <span>My events</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/coordinator/payments"}
                    tooltip="Collect payments"
                  >
                    <Link href="/coordinator/payments">
                      <HandCoins />
                      <span>Payments</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Assigned events</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {events.map((ev) => (
                  <SidebarMenuItem key={ev.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(`/coordinator/${ev.id}`)}
                      tooltip={ev.name}
                    >
                      <Link href={`/coordinator/${ev.id}`}>
                        <CalendarDays />
                        <span>{ev.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {events.length === 0 && (
                  <p className="px-2 text-xs text-muted-foreground">
                    No events assigned yet.
                  </p>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser name={userName} email={userEmail} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="px-4 py-6 md:px-6 md:py-8">
          <SidebarTrigger className="-ml-2 mb-4 md:hidden" />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}