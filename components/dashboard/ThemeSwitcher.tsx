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
import { THEMES } from "@/lib/themes";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

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

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Color Scheme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="flex cursor-pointer items-center gap-3 py-2.5"
          >
            {/* Two-tone swatch: bg + primary */}
            <div
              className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-full border border-white/10"
              style={{ background: t.bgColor }}
            >
              <div
                className="h-3 w-6"
                style={{ background: t.primaryColor }}
              />
            </div>

            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-sm font-medium leading-none">
                {t.label}
              </span>
              <span className="text-xs text-muted-foreground leading-none">
                {t.description}
              </span>
            </div>

            {theme === t.id && (
              <Check className="h-4 w-4 flex-shrink-0 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
