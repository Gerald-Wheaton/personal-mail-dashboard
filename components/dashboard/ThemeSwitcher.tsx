"use client";

import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { THEMES, type Theme } from "@/lib/themes";

function ThemeRow({ t, active }: { t: Theme; active: boolean }) {
  const { setTheme } = useTheme();
  return (
    <DropdownMenuItem
      onClick={() => setTheme(t.id)}
      className="flex cursor-pointer items-center gap-3 py-2.5"
    >
      {/* Two-tone swatch: primary stripe over bg */}
      <div
        className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-full border border-black/10"
        style={{ background: t.bgColor }}
      >
        <div className="h-3 w-6" style={{ background: t.primaryColor }} />
      </div>

      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium leading-none">{t.label}</span>
        <span className="text-xs leading-none text-muted-foreground">
          {t.description}
        </span>
      </div>

      {active && <Check className="h-4 w-4 flex-shrink-0 text-primary" />}
    </DropdownMenuItem>
  );
}

export function ThemeSwitcher() {
  const { theme } = useTheme();

  const dark = THEMES.filter((t) => t.dark);
  const light = THEMES.filter((t) => !t.dark);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="border border-border/60 bg-secondary/50"
          title="Switch color scheme"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Dark
        </DropdownMenuLabel>
        {dark.map((t) => (
          <ThemeRow key={t.id} t={t} active={theme === t.id} />
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Light
        </DropdownMenuLabel>
        {light.map((t) => (
          <ThemeRow key={t.id} t={t} active={theme === t.id} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
