// src/pages/Messages.tsx
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { ChatUI } from "@/components/chat/ChatUI";
import { Loader2, MessageSquare } from "lucide-react"; // <-- Import MessageSquare icon
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // <-- Import Card components

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
    <div className="min-h-screen bg-background text-foreground pr-[5.5rem] pl-[1.5rem]">
      <RightSidebar />
      <div className="p-6">
        {/* --- UPDATED HEADER --- */}
        <Card className="mb-8 shadow-sm bg-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl font-bold">Messages</CardTitle>
                <CardDescription className="mt-1">
                  {user.role === 'user' 
                    ? "Chat with your doctors and counselors." 
                    : "Communicate securely with your patients."
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
        {/* --- END UPDATED HEADER --- */}

        {/* Render the reusable chat UI */}
        <ChatUI user={user} />
      </div>
    </div>
  );
};

export default Messages;