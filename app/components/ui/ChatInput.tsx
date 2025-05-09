import React from "react";
import { Input } from "./input";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ChatInputProps extends React.ComponentPropsWithoutRef<"div"> {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  isProcessing: boolean;
  voiceComponent: React.ReactNode;
}

const ChatInput = React.forwardRef<HTMLDivElement, ChatInputProps>(
  ({ className, input, setInput, handleSend, handleKeyDown, isProcessing, voiceComponent, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 border-t p-4 bg-white backdrop-blur-sm sticky bottom-0",
          className
        )}
        {...props}
      >
        <div className="relative flex-1 max-w-3xl mx-auto w-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isProcessing ? "AI is thinking..." : "Message RightHome AI..."}
            disabled={isProcessing}
            className="pr-20 pl-4 rounded-full py-6 bg-white border-slate-300 focus-visible:ring-blue-600 shadow-sm"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
            {voiceComponent}
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              disabled={!input.trim() || isProcessing}
              className={cn(
                "h-9 w-9 rounded-full mr-1",
                !input.trim() || isProcessing
                  ? "text-slate-400"
                  : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              )}
              onClick={handleSend}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M10 14L21 3m0 0-6.5 18a.55.55 0 0 1-1 0L10 14l-7-3.5a.55.55 0 0 1 0-1L21 3" />
              </svg>
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
ChatInput.displayName = "ChatInput";

export { ChatInput }; 