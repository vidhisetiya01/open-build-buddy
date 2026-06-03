import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  hideNav?: boolean;
}

export function AppShell({ children, title, subtitle, right, hideNav }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        {(title || right) && (
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-5 py-4 backdrop-blur">
            <div>
              {title && <h1 className="text-lg font-semibold tracking-tight">{title}</h1>}
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            {right}
          </header>
        )}
        <main className={`flex-1 ${hideNav ? "" : "pb-24"}`}>{children}</main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
