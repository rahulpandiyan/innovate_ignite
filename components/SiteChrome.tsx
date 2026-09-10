"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

const APP_SHELL_PREFIXES = [
  "/admin",
  "/coordinator",
  "/dashboard",
  "/judge",
  "/attendance",
  "/certificates",
  "/payments",
  "/college-admin",
];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppShell = APP_SHELL_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isAppShell) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}