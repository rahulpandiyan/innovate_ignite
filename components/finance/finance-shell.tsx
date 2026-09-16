"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import dashboardLogo from "@/public/gat-logos/dashboard-logo.webp";
import { Wallet, ReceiptText } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function FinanceShell({
  userName,
  userEmail,
  children,
}: {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === "/payments" || pathname.startsWith("/payments/");

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/payments">
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
                    <span className="truncate font-semibold">Payments</span>
                    <span className="truncate text-xs">Finance desk</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive} tooltip="Payment ledger">
                    <Link href="/payments">
                      <ReceiptText />
                      <span>Payment ledger</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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