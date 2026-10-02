"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type SearchableOption = {
  value: string;
  label: string;
  description?: string;
  keywords?: string;
  disabled?: boolean;
};

/**
 * Select with an inline search box. Use this anywhere the option list can grow
 * past a handful of entries (coordinators, judges, events) so the right one can
 * be found by typing instead of scrolling.
 *
 * Single mode keeps one value; multi mode toggles any number and keeps them in
 * `value` order. `renderTrigger` lets callers customise the closed-state chip.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No matches found.",
  multiple = false,
  disabled = false,
  className,
  triggerClassName,
  renderTrigger,
}: {
  options: SearchableOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  renderTrigger?: (selected: SearchableOption[]) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = React.useMemo(
    () => options.filter((o) => value.includes(o.value)),
    [options, value]
  );

  function toggle(opt: SearchableOption) {
    if (opt.disabled) return;
    if (multiple) {
      onChange(value.includes(opt.value) ? value.filter((v) => v !== opt.value) : [...value, opt.value]);
      return;
    }
    onChange([opt.value]);
    setOpen(false);
  }

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "h-9 w-full justify-between gap-2 px-3 font-normal",
              !selected.length && "text-muted-foreground",
              triggerClassName
            )}
          >
            <span className="min-w-0 flex-1 truncate text-left">
              {renderTrigger
                ? renderTrigger(selected)
                : selected.length
                  ? multiple
                    ? selected.map((s) => s.label).join(", ")
                    : selected[0].label
                  : placeholder}
            </span>
            <span className="flex shrink-0 items-center gap-1">
              {selected.length > 0 && multiple ? (
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label="Clear selection"
                  className="rounded p-0.5 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange([]);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              ) : null}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter>
            <div className="relative border-b">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <CommandInput
                placeholder={searchPlaceholder}
                className="h-10 border-0 pl-8 focus-visible:ring-0"
              />
            </div>
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const isSelected = value.includes(opt.value);
                  return (
                    <CommandItem
                      key={opt.value}
                      value={`${opt.label} ${opt.description ?? ""} ${opt.keywords ?? ""}`}
                      disabled={opt.disabled}
                      onSelect={() => toggle(opt)}
                      className="cursor-pointer gap-2"
                    >
                      <Check
                        className={cn("h-4 w-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{opt.label}</span>
                        {opt.description && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {opt.description}
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}