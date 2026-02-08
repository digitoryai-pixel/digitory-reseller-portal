"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  PlusCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DigitoryLogo } from "@/components/shared/digitory-logo";

interface SidebarProps {
  role: string;
  open: boolean;
  onClose: () => void;
}

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Resellers", href: "/admin/resellers", icon: Users },
  { label: "Referrals", href: "/admin/referrals", icon: FileText },
  { label: "Commissions", href: "/admin/commissions", icon: DollarSign },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const resellerNav = [
  { label: "Dashboard", href: "/reseller", icon: LayoutDashboard },
  { label: "New Referral", href: "/reseller/referrals/new", icon: PlusCircle },
  { label: "My Referrals", href: "/reseller/referrals", icon: FileText },
  { label: "Commissions", href: "/reseller/commissions", icon: DollarSign },
  { label: "Settings", href: "/reseller/settings", icon: Settings },
];

export function Sidebar({ role, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "ADMIN" ? adminNav : resellerNav;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href={role === "ADMIN" ? "/admin" : "/reseller"} className="flex items-center gap-2">
            <DigitoryLogo size={32} />
            <span className="text-lg font-semibold">Digitory</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" &&
                  item.href !== "/reseller" &&
                  pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              {role === "ADMIN" ? "Admin Portal" : "Reseller Portal"}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Digitory Partner Program
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
