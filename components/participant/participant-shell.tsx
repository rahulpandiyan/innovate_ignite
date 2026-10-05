"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import dashboardLogo from "@/public/gat-logos/dashboard-logo.webp";
import {
  LayoutDashboard,
  CalendarDays,
  TicketCheck,
  UsersRound,
  Receipt,
  CircleUserRound,
} from "lucide-react";
import { NavUser } from "@/components/nav-user";
import { BottomNav } from "@/components/participant/bottom-nav";
import { WhatsAppFloatButton } from "@/components/participant/whatsapp-float-button";
import { Button } from "@/components/ui/button";
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

export const PARTICIPANT_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/registrations", label: "My Registrations", icon: TicketCheck },
  { href: "/dashboard/teams", label: "My Teams", icon: UsersRound },
  { href: "/dashboard/orders", label: "Orders", icon: Receipt },
  { href: "/dashboard/profile", label: "Profile", icon: CircleUserRound },
];

export function ParticipantShell({
  userName,
  userEmail,
  children,
}: {
  userName: string;
  userEmail: string;
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
                <Link href="/dashboard">
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
                    <span className="truncate font-semibold">My Innovate Ignite</span>
                    <span className="truncate text-xs">Participant</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>My space</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {PARTICIPANT_NAV.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            name={userName}
            email={userEmail}
            profileHref="/dashboard/profile"
            eventsHref="/events"
          />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex items-center justify-between px-4 pt-6 md:px-6 md:pt-8">
          <SidebarTrigger className="-ml-2 md:hidden" />
          <Button asChild size="lg" className="h-12 rounded-xl bg-[#2362EC] px-5 text-base font-bold text-white shadow-sm hover:bg-[#1d4ed8]">
            <Link href="/events">
              <CalendarDays className="mr-2 h-5 w-5" /> Back to Events
            </Link>
          </Button>
        </div>
        <div className="px-4 pb-20 pt-4 md:px-6 md:pb-8 md:pt-4">
          {children}
        </div>
        <footer className="border-t px-4 py-5 md:px-6">
          <Link
            href="/events"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#F3C317] px-5 text-base font-bold text-[#0F172A] shadow-sm transition-colors hover:bg-[#e5b810]"
          >
            <CalendarDays className="h-5 w-5" /> Back to Events
          </Link>
        </footer>
      </SidebarInset>
      <WhatsAppFloatButton />
      <BottomNav />
    </SidebarProvider>
  );
}
