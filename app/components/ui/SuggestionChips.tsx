import React from "react";
import { cn } from "@/lib/utils";

type Suggestion = {
  text: string;
  onClick: () => void;
};

interface SuggestionChipsProps extends React.HTMLAttributes<HTMLDivElement> {
  suggestions: Suggestion[];
}

const SuggestionChips = React.forwardRef<HTMLDivElement, SuggestionChipsProps>(
  ({ className, suggestions, ...props }, ref) => {
    if (suggestions.length === 0) return null;

    return (
      <div
        ref={ref}
        className={cn("px-4 py-3", className)}
        {...props}
      >
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={suggestion.onClick}
              className="inline-flex items-center bg-white border border-slate-200 text-sm rounded-full px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600 shadow-sm"
            >
              {suggestion.text}
            </button>
          ))}
        </div>
      </div>
    );
  }
);
SuggestionChips.displayName = "SuggestionChips";

export { SuggestionChips }; 