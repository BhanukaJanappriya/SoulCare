// src/pages/Patient/PatientMessages.tsx
// (This is a NEW FILE)

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChatUI } from "@/components/chat/ChatUI"; // Re-use the same component
import { Loader2 } from "lucide-react";

const PatientMessages: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show a loader while user data is being fetched
  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Messages</h1>
        <p className="text-muted-foreground">
          Chat with your doctors and counselors.
        </p>
      </div>
      
      {/* Render the reusable chat UI */}
      <ChatUI user={user} />
      
    </div>
  );
};

export default PatientMessages;