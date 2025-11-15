// src/pages/Patient/PatientMessages.tsx

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChatUI } from "@/components/chat/ChatUI"; // Re-use the same component
import { Loader2, MessageSquare } from "lucide-react"; // <-- Import MessageSquare icon
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // <-- Import Card components

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
      {/* --- UPDATED HEADER --- */}
      <Card className="mb-8 shadow-sm bg-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold">Messages</CardTitle>
              <CardDescription className="mt-1">
                Chat with your doctors and counselors.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      {/* --- END UPDATED HEADER --- */}

      {/* Render the reusable chat UI */}
      <ChatUI user={user} />
    </div>
  );
};

export default PatientMessages;