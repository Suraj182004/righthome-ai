'use client';

import { useState, useRef, useEffect } from 'react';
import VoiceAssistant from './VoiceAssistant';
import { MessageList } from './ui/MessageList';
import { ChatInput } from './ui/ChatInput';
import { SuggestionChips } from './ui/SuggestionChips';
import { PropertyDetailModal } from './ui/PropertyDetailModal';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  properties?: Property[];
};

type Property = {
  id: string;
  projectName?: string;
  address: string;
  price: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  possessionDate?: string;
  builder?: string;
  amenities: string[];
  description: string;
  images: string[];
  ctaOptions?: string[];
};

type Suggestion = {
  text: string;
  onClick: () => void;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: "Hi, I'm your property co-pilot. Looking for a home or investment? I'll help you shortlist the best ones and book visits too.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      text: "I want to buy a flat in Gurgaon",
      onClick: () => handleSuggestionClick("I want to buy a flat in Gurgaon")
    },
    {
      text: "Looking for a 3BHK in Dubai under 2 Cr",
      onClick: () => handleSuggestionClick("Looking for a 3BHK in Dubai under 2 Cr")
    },
    {
      text: "Show me top builder projects",
      onClick: () => handleSuggestionClick("Show me top builder projects")
    }
  ]);
  const [userId] = useState<string>(`user-${Date.now()}`);
  const [currentChatId] = useState<string>(`chat-${Date.now()}`);
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle suggestion click
  const handleSuggestionClick = (text: string) => {
    setInput(text);
    handleSendMessage(text);
  };

  const processMessageWithAI = async (messageText: string) => {
    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Add a temporary "thinking" message
      const thinkingId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev, 
        {
          id: thinkingId,
          role: 'ai',
          content: '...',
          timestamp: new Date(),
        }
      ]);
      
      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageText,
          userId: userId,
          chatId: currentChatId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Generate dynamic suggestions based on stage
      updateSuggestions(data.stage, data.nextQuestion);
      
      // Remove the thinking message and add the real AI response
      setMessages((prev) => {
        const filtered = prev.filter(m => m.id !== thinkingId);
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            role: 'ai',
            content: data.message,
            timestamp: new Date(),
            properties: data.properties,
          }
        ];
      });
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Remove any thinking message
      setMessages((prev) => {
        const filtered = prev.filter(m => m.content !== '...');
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            role: 'ai',
            content: 'I apologize, but I encountered an error processing your request. Please try again later.',
            timestamp: new Date(),
          }
        ];
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePropertyObjection = (objectionType: string) => {
    let objectionMessage = "";
    
    switch(objectionType) {
      case "location":
        objectionMessage = "The location isn't right for me. Do you have properties in other areas?";
        break;
      case "price":
        objectionMessage = "The price is higher than my budget. Do you have more affordable options?";
        break;
      case "amenities":
        objectionMessage = "I'm looking for better amenities. Can you show me properties with premium features?";
        break;
      case "size":
        objectionMessage = "I need a larger space. Can you show me bigger properties?";
        break;
      default:
        objectionMessage = "These properties don't match what I'm looking for. Can you show me different options?";
    }
    
    handleSendMessage(objectionMessage);
  };
  
  // Generate dynamic suggestions based on conversation stage
  const updateSuggestions = (stage: number, nextQuestion?: string) => {
    let newSuggestions: Suggestion[] = [];
    
    switch (stage) {
      case 1:
        // Initial suggestions
        newSuggestions = [
          {
            text: "I want to buy a flat in Gurgaon",
            onClick: () => handleSuggestionClick("I want to buy a flat in Gurgaon")
          },
          {
            text: "Looking for a 3BHK in Dubai under 2 Cr",
            onClick: () => handleSuggestionClick("Looking for a 3BHK in Dubai under 2 Cr")
          },
          {
            text: "Show me top builder projects",
            onClick: () => handleSuggestionClick("Show me top builder projects")
          }
        ];
        break;
        
      case 2:
        // After user expresses interest in buying/renting
        newSuggestions = [
          {
            text: "2 BHK",
            onClick: () => handleSuggestionClick("I'm looking for a 2 BHK")
          },
          {
            text: "3 BHK",
            onClick: () => handleSuggestionClick("I need a 3 BHK")
          },
          {
            text: "4 BHK",
            onClick: () => handleSuggestionClick("I want to see 4 BHK options")
          }
        ];
        break;
        
      case 3:
        // After user specifies type
        newSuggestions = [
          {
            text: "Under 1.5 Cr",
            onClick: () => handleSuggestionClick("My budget is under 1.5 Cr")
          },
          {
            text: "1.5 Cr - 2.5 Cr",
            onClick: () => handleSuggestionClick("My budget is between 1.5 and 2.5 Cr")
          },
          {
            text: "Above 2.5 Cr",
            onClick: () => handleSuggestionClick("My budget is more than 2.5 Cr")
          }
        ];
        break;
        
      case 4:
        // After budget specification
        newSuggestions = [
          {
            text: "Good schools nearby",
            onClick: () => handleSuggestionClick("I need a place with good schools nearby")
          },
          {
            text: "Close to metro",
            onClick: () => handleSuggestionClick("Location should be close to metro")
          },
          {
            text: "Gated community",
            onClick: () => handleSuggestionClick("I prefer a gated community")
          }
        ];
        break;
        
      case 5:
        // After location preference
        newSuggestions = [
          {
            text: "Ready to move in",
            onClick: () => handleSuggestionClick("I want a ready to move in property")
          },
          {
            text: "Within 6 months",
            onClick: () => handleSuggestionClick("Possession within 6 months would be ideal")
          },
          {
            text: "Future possession is fine",
            onClick: () => handleSuggestionClick("I'm okay with future possession date")
          }
        ];
        break;
        
      case 6:
        // When viewing properties
        newSuggestions = [
          {
            text: "Show more options",
            onClick: () => handleSuggestionClick("Can you show me more options?")
          },
          {
            text: "Different location",
            onClick: () => handlePropertyObjection("location")
          },
          {
            text: "Lower budget",
            onClick: () => handlePropertyObjection("price")
          }
        ];
        break;
        
      case 7:
        // After expressing interest in a property
        newSuggestions = [
          {
            text: "Schedule a visit",
            onClick: () => handleSuggestionClick("I'd like to schedule a visit")
          },
          {
            text: "Talk to sales representative",
            onClick: () => handleSuggestionClick("Can I talk to a sales representative?")
          },
          {
            text: "More details about payment plan",
            onClick: () => handleSuggestionClick("Tell me more about the payment plan")
          }
        ];
        break;
        
      default:
        // Default suggestions
        if (nextQuestion) {
          // Dynamic suggestions based on the next question
          const questionLower = nextQuestion.toLowerCase();
          
          if (questionLower.includes("budget") || questionLower.includes("price")) {
            newSuggestions = [
              {
                text: "Under 1 Cr",
                onClick: () => handleSuggestionClick("Under 1 Cr")
              },
              {
                text: "1 Cr - 2 Cr",
                onClick: () => handleSuggestionClick("Between 1 Cr and 2 Cr")
              },
              {
                text: "Above 2 Cr",
                onClick: () => handleSuggestionClick("Above 2 Cr")
              }
            ];
          } else if (questionLower.includes("bedroom") || questionLower.includes("bhk")) {
            newSuggestions = [
              {
                text: "2 BHK",
                onClick: () => handleSuggestionClick("2 BHK")
              },
              {
                text: "3 BHK",
                onClick: () => handleSuggestionClick("3 BHK")
              },
              {
                text: "4 BHK",
                onClick: () => handleSuggestionClick("4 BHK")
              }
            ];
          } else if (questionLower.includes("location") || questionLower.includes("area") || questionLower.includes("where")) {
            newSuggestions = [
              {
                text: "Gurgaon",
                onClick: () => handleSuggestionClick("Gurgaon")
              },
              {
                text: "South Delhi",
                onClick: () => handleSuggestionClick("South Delhi")
              },
              {
                text: "Noida",
                onClick: () => handleSuggestionClick("Noida")
              }
            ];
          } else {
            newSuggestions = [
              {
                text: "Yes",
                onClick: () => handleSuggestionClick("Yes")
              },
              {
                text: "No",
                onClick: () => handleSuggestionClick("No")
              },
              {
                text: "Tell me more",
                onClick: () => handleSuggestionClick("Can you tell me more about this?")
              }
            ];
          }
        } else {
          newSuggestions = [
            {
              text: "Show more properties",
              onClick: () => handleSuggestionClick("Show me more properties")
            },
            {
              text: "Start over",
              onClick: () => startNewChat()
            },
            {
              text: "Different requirements",
              onClick: () => handleSuggestionClick("I have different requirements")
            }
          ];
        }
    }
    
    setSuggestions(newSuggestions);
  };
  
  const handleSendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;
    
    setInput('');
    processMessageWithAI(messageText);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleVoiceTranscription = async (text: string) => {
    processMessageWithAI(text);
  };
  
  const handlePropertySelect = (id: string) => {
    // Find the property in the messages
    for (const message of messages) {
      if (message.properties) {
        const property = message.properties.find(p => p.id === id);
        if (property) {
          // Add default CTA options if not present
          if (!property.ctaOptions || property.ctaOptions.length === 0) {
            property.ctaOptions = [
              "Schedule Visit",
              "Get Price Details",
              "Check Availability",
              "Contact Agent"
            ];
          }
          
          setSelectedProperty(property);
          return;
        }
      }
    }
  };
  
  const handleClosePropertyDetail = () => {
    setSelectedProperty(null);
  };
  
  const handleAction = (property: Property, action: string) => {
    // Process the action
    const actionMessage = `I want to ${action.toLowerCase()} for ${property.projectName || property.address.split(',')[0]}`;
    handleSendMessage(actionMessage);
    setSelectedProperty(null);
  };
  
  const startNewChat = () => {
    // Clear chat history except the welcome message
    setMessages([
      {
        id: '1',
        role: 'ai',
        content: "Hi, I'm your property co-pilot. Looking for a home or investment? I'll help you shortlist the best ones and book visits too.",
        timestamp: new Date(),
      }
    ]);
    
    // Reset suggestions to initial state
    setSuggestions([
      {
        text: "I want to buy a flat in Gurgaon",
        onClick: () => handleSuggestionClick("I want to buy a flat in Gurgaon")
      },
      {
        text: "Looking for a 3BHK in Dubai under 2 Cr",
        onClick: () => handleSuggestionClick("Looking for a 3BHK in Dubai under 2 Cr")
      },
      {
        text: "Show me top builder projects",
        onClick: () => handleSuggestionClick("Show me top builder projects")
      }
    ]);
    
    // We need to force a rerender, which the state updates will do
    setMessages((prev) => [prev[0]]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div>
            <h3 className="font-medium">RightHome AI</h3>
            <p className="text-xs text-slate-500">Powered by AI</p>
          </div>
        </div>
        <button 
          onClick={startNewChat}
          className="text-sm text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors flex items-center space-x-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto bg-slate-50">
        <div className="max-w-3xl mx-auto w-full">
          <MessageList 
            messages={messages}
            onPropertySelect={handlePropertySelect}
          />
          <div ref={messageEndRef} />
        </div>
      </div>
      
      {/* Suggestions */}
      <div className="border-t bg-white">
        <div className="max-w-3xl mx-auto w-full">
          <SuggestionChips suggestions={suggestions} />
        </div>
      </div>
      
      {/* Input */}
      <ChatInput
        input={input}
        setInput={setInput}
        handleSend={handleSendMessage}
        handleKeyDown={handleKeyDown}
        isProcessing={isProcessing}
        voiceComponent={
          <VoiceAssistant onTranscription={handleVoiceTranscription} />
        }
      />
      
      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal 
          property={selectedProperty}
          onClose={handleClosePropertyDetail}
          onAction={handleAction}
        />
      )}
    </div>
  );
} 