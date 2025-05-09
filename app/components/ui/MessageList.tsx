import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";
import PropertyCard from "../PropertyCard";

type MessageProps = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  properties?: any[];
  timestamp: Date;
};

const MessageList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { messages: MessageProps[], onPropertySelect: (id: string) => void }
>(({ className, messages, onPropertySelect, ...props }, ref) => {
  return (
    <div 
      ref={ref} 
      className={cn("flex flex-col gap-4 p-4", className)}
      {...props}
    >
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={cn(
            "flex w-full",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div className={cn(
            "flex gap-3 max-w-[85%] w-full",
            message.role === "user" ? "flex-row-reverse" : "flex-row"
          )}>
            {message.role === "user" ? (
              <Avatar className="h-8 w-8 border bg-blue-100">
                <AvatarFallback className="text-blue-600">U</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-8 w-8 border bg-gradient-to-br from-blue-500 to-purple-600">
                <AvatarImage src="/ai-assistant.png" alt="AI" />
                <AvatarFallback className="text-white">AI</AvatarFallback>
              </Avatar>
            )}
            <div className={cn(
              "flex flex-col gap-2",
              message.role === "ai" ? "w-full" : ""
            )}>
              <Card 
                className={cn(
                  "shadow-sm",
                  message.role === "user" 
                    ? "bg-blue-600 text-white border-blue-600 rounded-2xl rounded-tr-sm"
                    : "bg-white border-slate-200 rounded-2xl rounded-tl-sm"
                )}
              >
                <CardContent className="p-3 text-sm whitespace-pre-wrap">
                  {message.content === '...' ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  ) : (
                    message.content
                  )}
                </CardContent>
              </Card>
              
              {message.properties && message.properties.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {message.properties.map(property => (
                    <PropertyCard 
                      key={property.id}
                      property={property}
                      onSelect={onPropertySelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
MessageList.displayName = "MessageList";

export { MessageList }; 