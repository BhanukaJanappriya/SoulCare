// src/components/chat/ChatUI.tsx
import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getContactList, getMessageHistory } from "@/api";
import { User, Conversation, ChatMessage } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Search,
  Phone,
  Video,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatUIProps {
  user: User; // The currently logged-in user
}

// Helper function to get WebSocket URL
const getWebSocketURL = (conversationId: number) => {
  const token = localStorage.getItem("accessToken");
  // Assumes your backend runs on localhost:8000
  return `ws://localhost:8000/ws/chat/${conversationId}/?token=${token}`;
};

// Helper function to format timestamps
const formatTimestamp = (isoString: string) => {
  const date = parseISO(isoString);
  if (isToday(date)) {
    return format(date, "p"); // e.g., 2:30 PM
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "MMM d"); // e.g., Oct 25
};

export const ChatUI: React.FC<ChatUIProps> = ({ user }) => {
  const queryClient = useQueryClient();
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const webSocket = useRef<WebSocket | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  // 1. Fetch the contact list
  const { data: conversations, isLoading: isLoadingContacts, isError: isErrorContacts } = useQuery<Conversation[]>({
    queryKey: ["contacts"],
    queryFn: getContactList,
  });

  // 2. Fetch messages for the selected conversation
  const {
    data: messages,
    isLoading: isLoadingMessages,
  } = useQuery<ChatMessage[]>({
    queryKey: ["messages", selectedConvo?.id],
    queryFn: () => getMessageHistory(selectedConvo!.id),
    enabled: !!selectedConvo, // Only fetch if a conversation is selected
  });

  // 3. Handle WebSocket connection
  useEffect(() => {
    // Close any existing connection
    if (webSocket.current) {
      webSocket.current.close();
    }

    if (selectedConvo) {
      // Open a new WebSocket connection
      const ws = new WebSocket(getWebSocketURL(selectedConvo.id));

      ws.onopen = () => {
        console.log(`WebSocket connected for conversation ${selectedConvo.id}`);
      };

      ws.onmessage = (event) => {
        const newMessage: ChatMessage = JSON.parse(event.data);

        // Add the new message to the query cache for this conversation
        queryClient.setQueryData<ChatMessage[]>(
          ["messages", selectedConvo.id],
          (oldMessages = []) => [...oldMessages, newMessage]
        );

        // Update the "last_message" in the contact list cache
        queryClient.setQueryData<Conversation[]>(
          ["contacts"],
          (oldContacts = []) =>
            oldContacts.map((convo) =>
              convo.id === newMessage.conversation
                ? { ...convo, last_message: newMessage }
                : convo
            )
        );
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      webSocket.current = ws;
    }

    // Cleanup: Close WebSocket on component unmount or when convo changes
    return () => {
      if (webSocket.current) {
        webSocket.current.close();
      }
    };
  }, [selectedConvo, queryClient]);

  // 4. Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  // 5. Handle sending a message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !webSocket.current || webSocket.current.readyState !== WebSocket.OPEN) {
      return;
    }

    // Send the message to the WebSocket server
    webSocket.current.send(
      JSON.stringify({
        message: newMessage,
      })
    );
    setNewMessage("");
  };
  
  // 6. Filter conversations based on search term
  const filteredConversations = conversations?.filter((conv) =>
    conv.other_user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)]"> {/* Adjusted height */}
      {/* --- Column 1: Conversations List --- */}
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {isLoadingContacts ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : isErrorContacts ? (
              <div className="p-4 text-center text-destructive">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                <p>Could not load contacts.</p>
              </div>
            ) : filteredConversations?.length === 0 ? (
                 <div className="p-4 text-center text-muted-foreground h-full flex flex-col justify-center items-center">
                    <MessageSquare className="w-12 h-12 mb-4" />
                    <h3 className="font-semibold">No Conversations</h3>
                    <p className="text-sm">Contacts appear here after you have a scheduled appointment.</p>
                </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations?.map((convo) => (
                  <div
                    key={convo.id}
                    className={cn(
                      "p-4 cursor-pointer transition-colors hover:bg-muted/50",
                      selectedConvo?.id === convo.id && "bg-muted"
                    )}
                    onClick={() => setSelectedConvo(convo)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                         {/* Add AvatarImage if you have profile pics */}
                        <AvatarFallback>
                          {convo.other_user.full_name?.split(" ").map((n) => n[0]).join("") || convo.other_user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-sm truncate">
                            {convo.other_user.full_name || convo.other_user.username}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {convo.last_message && formatTimestamp(convo.last_message.timestamp)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-muted-foreground truncate">
                            {convo.last_message?.content || "No messages yet."}
                          </p>
                          {convo.unread_count > 0 && (
                            <Badge className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
                              {convo.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* --- Column 2: Chat Area --- */}
      <Card className="lg:col-span-2 flex flex-col">
        {selectedConvo ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {selectedConvo.other_user.full_name?.split(" ").map((n) => n[0]).join("") || selectedConvo.other_user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedConvo.other_user.full_name || selectedConvo.other_user.username}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedConvo.other_user.role?.charAt(0).toUpperCase() + selectedConvo.other_user.role!.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" disabled><Phone className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" disabled><Video className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" disabled><MoreHorizontal className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[calc(100vh-380px)]" ref={messageListRef}>
                <div className="p-4 space-y-4">
                  {isLoadingMessages ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                  ) : (
                    messages?.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.sender.id === user.id ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] p-3 rounded-lg shadow-sm",
                            message.sender.id === user.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={cn(
                              "text-xs mt-1",
                              message.sender.id === user.id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground/70"
                            )}
                          >
                            {format(parseISO(message.timestamp), "p")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4 bg-card">
              <div className="flex gap-3">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 resize-none"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // --- Placeholder when no conversation is selected ---
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
              <p>Choose a contact from the list on the left to start messaging.</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};