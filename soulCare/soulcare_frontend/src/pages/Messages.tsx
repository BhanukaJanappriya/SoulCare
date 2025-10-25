// src/pages/Messages.tsx
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { ChatUI } from "@/components/chat/ChatUI";
import { Loader2 } from "lucide-react";

const Messages: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen pr-[5.5rem]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    // The pr-[5.5rem] assumes a w-16 sidebar + p-6 content padding
    <div className="min-h-screen bg-background text-foreground pr-[5.5rem]">
      <RightSidebar />
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Messages</h1>
          <p className="text-muted-foreground">
            Communicate securely with your patients.
          </p>
        </div>
        
        {/* Render the reusable chat UI */}
        <ChatUI user={user} />
        
      </div>
    </div>
  );
};

export default Messages;