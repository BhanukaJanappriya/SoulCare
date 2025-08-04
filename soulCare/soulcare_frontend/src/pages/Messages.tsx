import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Search,
  Paperclip,
  Phone,
  Video,
  MoreHorizontal,
  Circle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// messages management
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "doctor" | "counselor" | "patient";
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  patientId: string;
  patientName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    patientId: "1",
    patientName: "Sarah Johnson",
    lastMessage: "Thank you for the breathing exercises, they really helped!",
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    unreadCount: 2,
    isOnline: true,
    messages: [
      {
        id: "1",
        senderId: "1",
        senderName: "Sarah Johnson",
        senderRole: "patient",
        content:
          "Hi Dr. Smith, I've been practicing the breathing exercises you taught me.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
      },
      {
        id: "2",
        senderId: "doctor-1",
        senderName: "Dr. Sarah Smith",
        senderRole: "doctor",
        content:
          "That's wonderful to hear! How are you feeling overall? Any changes in your anxiety levels?",
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        read: true,
      },
      {
        id: "3",
        senderId: "1",
        senderName: "Sarah Johnson",
        senderRole: "patient",
        content:
          "Much better! The exercises really help when I feel overwhelmed.",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: true,
      },
      {
        id: "4",
        senderId: "1",
        senderName: "Sarah Johnson",
        senderRole: "patient",
        content: "Thank you for the breathing exercises, they really helped!",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
      },
    ],
  },
  {
    id: "2",
    patientId: "2",
    patientName: "Michael Chen",
    lastMessage: "Can we schedule our next session for next week?",
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unreadCount: 1,
    isOnline: false,
    messages: [
      {
        id: "5",
        senderId: "2",
        senderName: "Michael Chen",
        senderRole: "patient",
        content: "Hello, I wanted to follow up on our last session.",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: true,
      },
      {
        id: "6",
        senderId: "2",
        senderName: "Michael Chen",
        senderRole: "patient",
        content: "Can we schedule our next session for next week?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
      },
    ],
  },
];

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(conversations[0] || null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || "doctor-1",
      senderName: user?.name || "Dr. Smith",
      senderRole:
        user?.role === "doctor"
          ? "doctor"
          : user?.role === "counselor"
          ? "counselor"
          : user?.role === "patient"
          ? "patient"
          : "doctor",
      content: newMessage,
      timestamp: new Date(),
      read: true,
    };

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: newMessage,
          lastMessageTime: new Date(),
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
      lastMessage: newMessage,
      lastMessageTime: new Date(),
    });
    setNewMessage("");

    toast({
      title: "Message Sent",
      description: `Message sent to ${selectedConversation.patientName}`,
    });
  };

  const markAsRead = (conversationId: string) => {
    setConversations(
      conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              unreadCount: 0,
              messages: conv.messages.map((msg) => ({ ...msg, read: true })),
            }
          : conv
      )
    );
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-page-bg flex">
      <div className="flex-1 pr-16">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-dark mb-2">Messages</h1>
            <p className="text-text-muted">
              Communicate securely with your patients
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 max-h-[500px] overflow-y-auto">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedConversation?.id === conversation.id
                          ? "bg-blue-50 border-r-2 border-primary"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        markAsRead(conversation.id);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>
                              {conversation.patientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <Circle
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-current ${
                              conversation.isOnline
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-sm truncate">
                              {conversation.patientName}
                            </h4>
                            <span className="text-xs text-text-muted">
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-text-muted truncate">
                              {conversation.lastMessage}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {selectedConversation.patientName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {selectedConversation.patientName}
                          </CardTitle>
                          <p className="text-sm text-text-muted">
                            {selectedConversation.isOnline
                              ? "Online"
                              : "Offline"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 p-0">
                    <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                      {selectedConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderRole === "patient"
                              ? "justify-start"
                              : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.senderRole === "patient"
                                ? "bg-gray-100 text-text-dark"
                                : "bg-primary text-white"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.senderRole === "patient"
                                  ? "text-text-muted"
                                  : "text-white/70"
                              }`}
                            >
                              {formatMessageTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm">
                        <Paperclip className="w-4 h-4" />
                      </Button>
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
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-text-muted" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      No conversation selected
                    </h3>
                    <p className="text-text-muted">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}
