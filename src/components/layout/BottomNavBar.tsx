"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookCopy, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: BookCopy, label: "クイズ" },
  { href: "/stats", icon: BarChart3, label: "統計" },
  { href: "/files", icon: Settings, label: "設定" },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 border-t bg-background/80 backdrop-blur-sm z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid h-full max-w-md grid-cols-3 items-center px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary",
                isActive && "text-primary"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
