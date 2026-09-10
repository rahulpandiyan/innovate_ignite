"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";

export function AdminShell({
  userName,
  userEmail,
  children,
}: {
  userName?: string;
  userEmail?: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar userName={userName} userEmail={userEmail} />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-4 py-6 md:gap-6 md:py-8">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}