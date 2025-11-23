import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContactList, getMessageHistory, deleteMessageAPI } from "@/api";
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
  Smile,
  Trash2,
} from "lucide-react";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { EmojiClickData } from "emoji-picker-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

interface ChatUIProps {
  user: User;
}

const getWebSocketURL = (conversationId: number) => {
  const token = localStorage.getItem("accessToken");
  return `ws://localhost:8000/ws/chat/${conversationId}/?token=${token}`;
};

const formatTimestamp = (isoString: string) => {
  const date = parseISO(isoString);
  if (isToday(date)) return format(date, "p");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
};

export const ChatUI: React.FC<ChatUIProps> = ({ user }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const webSocket = useRef<WebSocket | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [messageToDelete, setMessageToDelete] = useState<ChatMessage | null>(null);

  const {
    data: conversations,
    isLoading: isLoadingContacts,
    isError: isErrorContacts,
  } = useQuery<Conversation[]>({
    queryKey: ["contacts"],
    queryFn: getContactList,
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery<ChatMessage[]>({
    queryKey: ["messages", selectedConvo?.id],
    queryFn: () => getMessageHistory(selectedConvo!.id),
    enabled: !!selectedConvo,
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: number) => deleteMessageAPI(messageId),
    onSuccess: (_, deletedMessageId) => {
      toast({
        title: "Message Deleted",
        description: "Your message has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message || "Could not delete message.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (webSocket.current) {
      webSocket.current.close();
    }
    if (selectedConvo) {
      const ws = new WebSocket(getWebSocketURL(selectedConvo.id));
      ws.onopen = () =>
        console.log(`WebSocket connected for conversation ${selectedConvo.id}`);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "delete_message") {
          const deletedMessageId = data.message_id;
          queryClient.setQueryData<ChatMessage[]>(
            ["messages", selectedConvo.id],
            (oldMessages = []) =>
              oldMessages.filter((msg) => msg.id !== deletedMessageId)
          );
          queryClient.invalidateQueries({ queryKey: ["contacts"] });
        } else {
          const newMessage: ChatMessage = data;
          queryClient.setQueryData<ChatMessage[]>(
            ["messages", selectedConvo.id],
            (oldMessages = []) => [...oldMessages, newMessage]
          );
          queryClient.setQueryData<Conversation[]>(
            ["contacts"],
            (oldContacts = []) =>
              oldContacts.map((convo) =>
                convo.id === newMessage.conversation
                  ? {
                      ...convo,
                      last_message: newMessage,
                      unread_count:
                        convo.id === selectedConvo.id
                          ? 0
                          : (convo.unread_count || 0) + 1,
                    }
                  : convo
              )
          );
        }
      };

      ws.onclose = () => console.log("WebSocket disconnected");
      ws.onerror = (error) => console.error("WebSocket error:", error);
      webSocket.current = ws;
    }
    return () => {
      if (webSocket.current) {
        webSocket.current.close();
      }
    };
  }, [selectedConvo, queryClient]);

  useEffect(() => {
    setTimeout(() => {
      if (messageListRef.current) {
        const viewport = messageListRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }, 50);
  }, [messages]);

  const handleSendMessage = () => {
    if (
      !newMessage.trim() ||
      !webSocket.current ||
      webSocket.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }
    webSocket.current.send(
      JSON.stringify({
        type: "chat_message",
        message: newMessage,
      })
    );
    setNewMessage("");
  };

  const filteredConversations = conversations?.filter(
    (conv) =>
      conv.other_user.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      conv.other_user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((currentMessage) => currentMessage + emojiData.emoji);
  };

  const handleDeleteClick = (message: ChatMessage) => {
    setMessageToDelete(message);
  };

  const confirmDelete = () => {
    if (messageToDelete) {
      deleteMessageMutation.mutate(messageToDelete.id);
      setMessageToDelete(null);
    }
  };

  const cancelDelete = () => {
    setMessageToDelete(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)]">
      {/* --- Column 1: Conversations List --- */}
      <Card className="lg:col-span-1 flex flex-col shadow-md overflow-hidden">
        <CardHeader className="border-b">
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
        <CardContent className="p-0 flex-1 min-h-0">
          <ScrollArea className="h-full">
            {isLoadingContacts ? (
              <div className="flex justify-center items-center h-full p-10">
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
                <p className="text-sm">
                  Contacts appear here after you have a scheduled appointment.
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredConversations?.map((convo) => (
                  <Button
                    variant="ghost"
                    key={convo.id}
                    className={cn(
                      "w-full h-auto justify-start p-3",
                      selectedConvo?.id === convo.id &&
                        "bg-accent text-accent-foreground"
                    )}
                    onClick={() => setSelectedConvo(convo)}
                  >
                    <div className="flex items-center gap-3 w-full overflow-hidden">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback>
                          {convo.other_user.full_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") ||
                            convo.other_user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-sm truncate">
                            {convo.other_user.full_name ||
                              convo.other_user.username}
                          </h4>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {convo.last_message &&
                              formatTimestamp(convo.last_message.timestamp)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-muted-foreground break-words whitespace-pre-wrap flex-1 min-w-0 pr-2">
                            {convo.last_message?.content || "No messages yet."}
                          </p>
                          {convo.unread_count > 0 && (
                            <Badge className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center p-0 flex-shrink-0">
                              {convo.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* --- Column 2: Chat Area --- */}
      <Card className="lg:col-span-2 flex flex-col shadow-md overflow-hidden">
        {selectedConvo ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {selectedConvo.other_user.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") ||
                        selectedConvo.other_user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedConvo.other_user.full_name ||
                        selectedConvo.other_user.username}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedConvo.other_user.role?.charAt(0).toUpperCase() +
                        selectedConvo.other_user.role!.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" disabled>
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" disabled>
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" disabled>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0 overflow-hidden min-h-0">
              <ScrollArea className="h-full" ref={messageListRef}>
                <div className="p-4 space-y-4">
                  {isLoadingMessages ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    messages?.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-end gap-2 group",
                          message.sender.id === user.id
                            ? "justify-end"
                            : "justify-start"
                        )}
                      >
                        {message.sender.id !== user.id && (
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback>
                              {selectedConvo.other_user.full_name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") ||
                                selectedConvo.other_user.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        {message.sender.id === user.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteClick(message)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}

                        <div
                          className={cn(
                            "max-w-[70%] p-3 rounded-lg shadow-sm break-words whitespace-pre-wrap", // Added whitespace-pre-wrap for newlines
                            message.sender.id === user.id
                              ? "bg-primary text-primary-foreground rounded-l-xl rounded-tr-xl"
                              : "bg-muted text-foreground rounded-r-xl rounded-tl-xl"
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={cn(
                              "text-xs mt-1 text-right",
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
            <div className="border-t p-3 bg-card flex-shrink-0">
              <div className="flex gap-2 items-center">
                <div className="flex-1 relative flex items-center border rounded-lg">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 pr-10"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                      >
                        <Smile className="w-5 h-5" />
                        <span className="sr-only">Add emoji</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 border-0">
                      <Suspense
                        fallback={
                          <div className="p-4">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                        }
                      >
                        <EmojiPicker onEmojiClick={onEmojiClick} />
                      </Suspense>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Placeholder
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No conversation selected
              </h3>
              <p>
                Choose a contact from the list on the left to start messaging.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!messageToDelete}
        onOpenChange={(open) => !open && cancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone and will remove it for everyone in this conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};