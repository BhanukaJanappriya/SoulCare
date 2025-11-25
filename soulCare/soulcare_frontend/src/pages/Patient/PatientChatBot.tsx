import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendChatbotMessageAPI } from "@/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Send,
  Bot,
  User,
  Heart,
  Brain,
  Shield,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  Wind,
  Type,
  Palette,
  Download,
} from "lucide-react";

// --- TYPES ---
interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "text" | "suggestion" | "resource";
  isTyping?: boolean;
}

// --- CONSTANTS ---
const suggestionPrompts = [
  "I'm feeling anxious today",
  "Help me with breathing exercises",
  "I'm having trouble sleeping",
  "How can I manage stress at work",
  "I need motivation to exercise",
  "Tell me about mindfulness techniques",
];

const quickResources = [
  {
    title: "Emergency Support",
    description: "24/7 crisis helpline",
    icon: Shield,
    color: "bg-red-100 text-red-700",
  },
  {
    title: "Breathing Exercise",
    description: "5-minute guided session",
    icon: Heart,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Mood Tracker",
    description: "Log your current feelings",
    icon: Brain,
    color: "bg-purple-100 text-purple-700",
  },
];

// --- THEME CONFIGURATIONS ---
const THEMES = {
  blue: {
    bg: "bg-blue-600",
    text: "text-blue-600",
    lightBg: "bg-blue-100",
    border: "border-blue-200",
  },
  purple: {
    bg: "bg-purple-600",
    text: "text-purple-600",
    lightBg: "bg-purple-100",
    border: "border-purple-200",
  },
  green: {
    bg: "bg-emerald-600",
    text: "text-emerald-600",
    lightBg: "bg-emerald-100",
    border: "border-emerald-200",
  },
  rose: {
    bg: "bg-rose-600",
    text: "text-rose-600",
    lightBg: "bg-rose-100",
    border: "border-rose-200",
  },
};

export default function PatientChatBot() {
  const navigate = useNavigate();

  // -- UI State --
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // -- Settings State --
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(
    "medium"
  );
  const [themeColor, setThemeColor] = useState<keyof typeof THEMES>("blue");
  const [isSoundOn, setIsSoundOn] = useState(false); // Default sound OFF

  // -- Breathing Exercise State --
  const [breathingPhase, setBreathingPhase] = useState<
    "Inhale" | "Hold" | "Exhale"
  >("Inhale");
  const [breathingTimer, setBreathingTimer] = useState(4);

  // -- Chat State --
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your SoulCare AI assistant. I'm here to provide emotional support, coping strategies, and mental health resources. How are you feeling today?",
      sender: "bot",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- SCROLL & VOICES ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Warm up voices on load (Fixes Chrome issue where voices aren't ready immediately)
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // --- BREATHING LOGIC ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathingOpen) {
      interval = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev === 1) {
            if (breathingPhase === "Inhale") {
              setBreathingPhase("Hold");
              return 4;
            } else if (breathingPhase === "Hold") {
              setBreathingPhase("Exhale");
              return 4;
            } else {
              setBreathingPhase("Inhale");
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathingPhase("Inhale");
      setBreathingTimer(4);
    }
    return () => clearInterval(interval);
  }, [isBreathingOpen, breathingPhase]);

  // --- TEXT TO SPEECH ENGINE ---
  const speakText = (text: string) => {
    if (!isSoundOn) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Settings for a "Calm" effect
    utterance.rate = 0.9; // Slightly slower
    utterance.pitch = 1.0; // Natural pitch
    utterance.volume = 1.0;

    // Try to find a female voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes("Zira") || // Windows (Microsoft Zira)
        voice.name.includes("Samantha") || // Mac (Samantha)
        voice.name.includes("Google US English") || // Chrome
        voice.name.includes("Female") ||
        voice.name.includes("Aria")
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // --- TYPING EFFECT ---
  const typeMessage = async (fullText: string) => {
    const botMsgId = (Date.now() + 1).toString();
    const botResponse: Message = {
      id: botMsgId,
      content: "",
      sender: "bot",
      timestamp: new Date(),
      type: "text",
      isTyping: true,
    };
    setMessages((prev) => [...prev, botResponse]);

    for (let i = 0; i <= fullText.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId ? { ...msg, content: fullText.slice(0, i) } : msg
        )
      );
    }
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === botMsgId ? { ...msg, isTyping: false } : msg
      )
    );
  };

  // --- HANDLERS ---
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // 1. Get Response from Backend
      const botResponseText = await sendChatbotMessageAPI(userMessage.content);

      // 2. Speak Response (if sound is on)
      speakText(botResponseText);

      setIsTyping(false);

      // 3. Type it out visually
      await typeMessage(botResponseText);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setIsTyping(false);
      const errorMsg =
        "I apologize, but I'm having trouble connecting right now.";
      speakText(errorMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: errorMsg,
          sender: "bot",
          timestamp: new Date(),
          type: "text",
        },
      ]);
    }
  };

  const handleQuickResourceClick = (title: string) => {
    if (title === "Mood Tracker") navigate("/patient/mood");
    else if (title === "Emergency Support") setIsEmergencyOpen(true);
    else if (title === "Breathing Exercise") setIsBreathingOpen(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleListening = () => setIsListening(!isListening);
  const handleSuggestionClick = (suggestion: string) =>
    setInputMessage(suggestion);

  const toggleSound = () => {
    if (isSoundOn) {
      window.speechSynthesis.cancel(); // Stop speaking immediately if turned off
      setIsSoundOn(false);
    } else {
      setIsSoundOn(true);
      // Optional: Confirm sound is on
      // const utterance = new SpeechSynthesisUtterance("Voice enabled");
      // window.speechSynthesis.speak(utterance);
    }
  };

  const exportConversation = () => {
    const text = messages
      .map((msg) => `${msg.sender.toUpperCase()}: ${msg.content}`)
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `soulcare-chat.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- DYNAMIC STYLES ---
  const getTextSize = () => {
    switch (fontSize) {
      case "small":
        return "text-xs";
      case "large":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  const activeTheme = THEMES[themeColor];

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8">
        <Card className="shadow-sm bg-card border-none ring-1 ring-gray-200/50">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${activeTheme.lightBg}`}>
                <Bot className={`h-8 w-8 ${activeTheme.text}`} />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  SoulCare Assistant
                </CardTitle>
                <CardDescription className="mt-1 text-gray-500">
                  Your personal mental health companion.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SIDEBAR */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className={`w-5 h-5 ${activeTheme.text}`} />
                Quick Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickResources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-3 hover:bg-gray-50 transition-colors"
                    onClick={() => handleQuickResourceClick(resource.title)}
                  >
                    <div className={`p-2 rounded-full mr-3 ${resource.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">
                        {resource.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {resource.description}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" /> Session started:{" "}
                {new Date().toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4" /> End-to-end encrypted
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exportConversation}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" /> Export Chat
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CHAT AREA */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col shadow-lg border-gray-200">
            <CardHeader className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-700">
                      Live Chat
                    </span>
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>{" "}
                      Online
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Sound Toggle Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSound}
                    className={
                      isSoundOn
                        ? `${activeTheme.text} ${activeTheme.lightBg}`
                        : "text-gray-400"
                    }
                  >
                    {isSoundOn ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* MESSAGES */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "bot" && (
                    <div className="p-2 bg-white border border-gray-200 rounded-full h-10 w-10 flex items-center justify-center shadow-sm">
                      <Bot className={`w-5 h-5 ${activeTheme.text}`} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                      message.sender === "user"
                        ? `${activeTheme.bg} text-white rounded-tr-none`
                        : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    <p
                      className={`${getTextSize()} leading-relaxed whitespace-pre-wrap`}
                    >
                      {message.content}
                      {message.isTyping && (
                        <span className="inline-block w-1.5 h-4 ml-1 bg-gray-400 animate-pulse align-middle"></span>
                      )}
                    </p>
                    <p
                      className={`text-[10px] mt-2 ${
                        message.sender === "user"
                          ? "text-blue-100"
                          : "text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.sender === "user" && (
                    <div
                      className={`p-2 ${activeTheme.bg} rounded-full h-10 w-10 flex items-center justify-center shadow-md`}
                    >
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="p-2 bg-white border border-gray-200 rounded-full h-10 w-10 flex items-center justify-center shadow-sm">
                    <Bot className={`w-5 h-5 ${activeTheme.text}`} />
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* INPUT AREA */}
            <div className="bg-white border-t p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestionPrompts.slice(0, 3).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-gray-50 hover:bg-gray-100 border-gray-200"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    className="pr-12 h-12 bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
                    disabled={isTyping}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 hover:bg-gray-200"
                    onClick={toggleListening}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4 text-red-500" />
                    ) : (
                      <Mic className="w-4 h-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className={`h-12 w-12 rounded-xl ${activeTheme.bg} hover:opacity-90 shadow-md`}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-[10px] text-center text-gray-400 mt-3">
                AI support is not a replacement for professional therapy. For
                emergencies, call 988.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* --- DIALOGS --- */}

      {/* EMERGENCY DIALOG */}
      <Dialog open={isEmergencyOpen} onOpenChange={setIsEmergencyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-6 w-6" /> Emergency Support
            </DialogTitle>
            <DialogDescription>
              If you are in immediate danger, please reach out now.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
              <div>
                <h4 className="font-semibold text-gray-900">
                  National Suicide Prevention Lifeline
                </h4>
                <p className="text-sm text-gray-500">
                  Available 24/7 for free and confidential support.
                </p>
              </div>
              <Button
                size="icon"
                variant="destructive"
                className="h-10 w-10 rounded-full"
              >
                <Phone className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <h4 className="font-semibold text-gray-900">
                  Crisis Text Line
                </h4>
                <p className="text-sm text-gray-500">Text HOME to 741741</p>
              </div>
              <Button
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-full border-blue-200 text-blue-600"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => setIsEmergencyOpen(false)}
            className="w-full"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* BREATHING DIALOG */}
      <Dialog open={isBreathingOpen} onOpenChange={setIsBreathingOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle
              className={`flex justify-center items-center gap-2 ${activeTheme.text}`}
            >
              <Wind className="h-6 w-6" /> Box Breathing
            </DialogTitle>
            <DialogDescription>
              Follow the visual guide to relax your mind.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 flex flex-col items-center justify-center gap-6">
            <div className="relative flex items-center justify-center w-48 h-48">
              <div
                className={`absolute w-full h-full rounded-full opacity-20 transition-all duration-1000 ease-in-out
                ${
                  breathingPhase === "Inhale"
                    ? `${activeTheme.bg} scale-100`
                    : ""
                }
                ${
                  breathingPhase === "Hold" ? `${activeTheme.bg} scale-110` : ""
                }
                ${breathingPhase === "Exhale" ? "bg-gray-400 scale-75" : ""}`}
              />
              <div
                className={`z-10 w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg transition-all duration-1000
                ${
                  breathingPhase === "Inhale"
                    ? `${activeTheme.bg} scale-110`
                    : ""
                }
                ${
                  breathingPhase === "Hold" ? `${activeTheme.bg} scale-100` : ""
                }
                ${breathingPhase === "Exhale" ? "bg-gray-400 scale-90" : ""}`}
              >
                {breathingPhase}
              </div>
            </div>
            <div className="text-4xl font-light text-gray-700 font-mono">
              00:0{breathingTimer}
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              {breathingPhase === "Inhale" &&
                "Breathe in deeply through your nose..."}
              {breathingPhase === "Hold" && "Hold your breath comfortably..."}
              {breathingPhase === "Exhale" &&
                "Exhale slowly through your mouth..."}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsBreathingOpen(false)}
            className="w-full"
          >
            End Session
          </Button>
        </DialogContent>
      </Dialog>

      {/* SETTINGS DIALOG */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" /> Chat Appearance
            </DialogTitle>
            <DialogDescription>
              Customize how the chat looks for you.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Type className="h-4 w-4 text-gray-500" />
                <Label className="font-semibold">Text Size</Label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={fontSize === "small" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setFontSize("small")}
                >
                  Small
                </Button>
                <Button
                  variant={fontSize === "medium" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setFontSize("medium")}
                >
                  Medium
                </Button>
                <Button
                  variant={fontSize === "large" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setFontSize("large")}
                >
                  Large
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4 text-gray-500" />
                <Label className="font-semibold">Theme Color</Label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setThemeColor("blue")}
                  className={`h-8 w-full rounded-md bg-blue-600 ${
                    themeColor === "blue"
                      ? "ring-2 ring-offset-2 ring-blue-600"
                      : ""
                  }`}
                />
                <button
                  onClick={() => setThemeColor("purple")}
                  className={`h-8 w-full rounded-md bg-purple-600 ${
                    themeColor === "purple"
                      ? "ring-2 ring-offset-2 ring-purple-600"
                      : ""
                  }`}
                />
                <button
                  onClick={() => setThemeColor("green")}
                  className={`h-8 w-full rounded-md bg-emerald-600 ${
                    themeColor === "green"
                      ? "ring-2 ring-offset-2 ring-emerald-600"
                      : ""
                  }`}
                />
                <button
                  onClick={() => setThemeColor("rose")}
                  className={`h-8 w-full rounded-md bg-rose-600 ${
                    themeColor === "rose"
                      ? "ring-2 ring-offset-2 ring-rose-600"
                      : ""
                  }`}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsOpen(false)} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
