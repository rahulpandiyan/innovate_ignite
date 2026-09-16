"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { EllipsisVertical, ShieldCheck, LogOut, CircleUserRound } from "lucide-react";
import { useSidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { avatarUrlFor } from "@/lib/avatar";

export function NavUser({
  name,
  email,
  profileHref,
}: {
  name: string;
  email: string;
  profileHref?: string;
}) {
  const { isMobile } = useSidebar();
  const avatarUrl = avatarUrlFor(email);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={avatarUrl}
                  alt={name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-cover"
                  unoptimized
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={avatarUrl}
                    alt={name}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-lg object-cover"
                    unoptimized
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="truncate text-xs text-muted-foreground">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {profileHref && (
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={profileHref}>
                  <CircleUserRound />
                  Profile
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/" target="_blank">
                <ShieldCheck />
                View site
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/auth/logout">
                <LogOut />
                Log out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
