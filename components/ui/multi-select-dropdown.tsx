"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";

interface MultiSelectDropdownProps {
  selectedLetters: string[];
  availableLetters: string[];
  disabledLetters: string[];
  onSelect: (letter: string) => void;
  onRemove: (letter: string) => void;
  onClear?: () => void;
  clearButtonLabel?: string;
  placeholder?: string;
  className?: string;
  variant?: "include" | "exclude";
}

export default function MultiSelectDropdown({
  selectedLetters,
  availableLetters,
  disabledLetters,
  onSelect,
  onRemove,
  onClear,
  clearButtonLabel,
  placeholder = "Sélectionner des lettres",
  className,
  variant = "include",
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLetterClick = (letter: string) => {
    if (selectedLetters.includes(letter)) {
      onRemove(letter);
    } else {
      onSelect(letter);
    }
  };

  const displayText = selectedLetters.length > 0
    ? selectedLetters.join(', ')
    : placeholder;

  const variantColors = variant === "include"
    ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
    : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100";

  const showClearButton = Boolean(onClear) && selectedLetters.length > 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div ref={dropdownRef} className="relative w-full">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between text-left font-normal h-10"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md">
            <div className="p-2">
              <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
                {availableLetters.map((letter) => {
                  const isSelected = selectedLetters.includes(letter);
                  const isDisabled = disabledLetters.includes(letter);

                  return (
                    <Button
                      key={letter}
                      type="button"
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      disabled={isDisabled}
                      className={cn(
                        "h-8 w-8 p-0 text-sm font-semibold",
                        isSelected
                          ? variant === "include"
                            ? "bg-emerald-600 hover:bg-emerald-500"
                            : "bg-rose-600 hover:bg-rose-500"
                          : ""
                      )}
                      onClick={() => handleLetterClick(letter)}
                    >
                      {letter}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {showClearButton && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
          aria-label={clearButtonLabel ?? "Effacer la sélection"}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
