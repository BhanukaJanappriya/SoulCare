import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Filter,
  Upload,
  Play,
  Pause,
  Download,
  Share,
  Edit,
  Trash2,
  FileText,
  Video,
  Music,
  Image,
  Eye,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ContentItem } from "@/types";

const mockContent: ContentItem[] = [
  {
    id: "1",
    authorId: "1",
    title: "Breathing Exercises for Anxiety",
    description:
      "A guided video showing various breathing techniques to help manage anxiety and stress.",
    type: "video",
    url: "/videos/breathing-exercises.mp4",
    tags: ["anxiety", "breathing", "relaxation", "guided"],
    patientIds: ["1", "2"],
    createdAt: new Date("2024-02-15"),
  },
  {
    id: "2",
    authorId: "1",
    title: "Mindfulness Meditation Audio",
    description: "20-minute guided mindfulness meditation for daily practice.",
    type: "audio",
    url: "/audio/mindfulness-meditation.mp3",
    tags: ["mindfulness", "meditation", "daily-practice"],
    patientIds: ["1", "3"],
    createdAt: new Date("2024-02-10"),
  },
  {
    id: "3",
    authorId: "1",
    title: "CBT Worksheet: Thought Challenging",
    description:
      "Interactive worksheet for cognitive behavioral therapy exercises.",
    type: "document",
    url: "/documents/cbt-worksheet.pdf",
    tags: ["cbt", "worksheet", "cognitive-therapy"],
    patientIds: ["2"],
    createdAt: new Date("2024-02-05"),
  },
];

const mockPatients = [
  { id: "1", name: "Sarah Johnson" },
  { id: "2", name: "Michael Chen" },
  { id: "3", name: "Emma Wilson" },
];

export default function Content() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState<ContentItem[]>(mockContent);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  const [newContent, setNewContent] = useState({
    title: "",
    description: "",
    type: "video" as ContentItem["type"],
    url: "",
    tags: "",
    patientIds: [] as string[],
  });

  const handleCreateContent = () => {
    if (!newContent.title || !newContent.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const contentItem: ContentItem = {
      id: Date.now().toString(),
      authorId: user?.id || "1",
      title: newContent.title,
      description: newContent.description,
      type: newContent.type,
      url: newContent.url || "#",
      tags: newContent.tags.split(",").map((tag) => tag.trim()),
      patientIds: newContent.patientIds,
      createdAt: new Date(),
    };

    setContent([contentItem, ...content]);
    setNewContent({
      title: "",
      description: "",
      type: "video",
      url: "",
      tags: "",
      patientIds: [],
    });
    setIsCreating(false);

    toast({
      title: "Content Created",
      description:
        "Your content has been successfully created and is ready to share.",
    });
  };

  const handleDeleteContent = (id: string) => {
    setContent(content.filter((item) => item.id !== id));
    toast({
      title: "Content Deleted",
      description: "The content item has been successfully deleted.",
    });
  };

  const handleShareContent = (item: ContentItem) => {
    toast({
      title: "Content Shared",
      description: `"${item.title}" has been shared with selected patients.`,
    });
  };

  const getTypeIcon = (type: ContentItem["type"]) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "audio":
        return <Music className="w-5 h-5" />;
      case "document":
        return <FileText className="w-5 h-5" />;
      case "image":
        return <Image className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: ContentItem["type"]) => {
    switch (type) {
      case "video":
        return "bg-blue-100 text-blue-800";
      case "audio":
        return "bg-green-100 text-green-800";
      case "document":
        return "bg-orange-100 text-orange-800";
      case "image":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "shared" && item.patientIds.length > 0) ||
      (activeTab === "unshared" && item.patientIds.length === 0);

    return matchesSearch && matchesType && matchesTab;
  });

  const getPatientName = (patientId: string) => {
    const patient = mockPatients.find((p) => p.id === patientId);
    return patient?.name || "Unknown Patient";
  };

  return (
    <div className="min-h-screen bg-page-bg flex">
      <div className="flex-1 pr-16">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-dark mb-2">
                Content Library
              </h1>
              <p className="text-text-muted">
                Manage and share therapeutic content with your patients
              </p>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Content
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Content</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newContent.title}
                        onChange={(e) =>
                          setNewContent({
                            ...newContent,
                            title: e.target.value,
                          })
                        }
                        placeholder="Content title..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Content Type</Label>
                      <Select
                        value={newContent.type}
                        onValueChange={(value: ContentItem["type"]) =>
                          setNewContent({ ...newContent, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newContent.description}
                      onChange={(e) =>
                        setNewContent({
                          ...newContent,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the content and its purpose..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="file">Upload File</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-text-muted">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-text-muted">
                        Support for videos, audio, documents, and images
                      </p>
                      <Button variant="outline" className="mt-2">
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={newContent.tags}
                      onChange={(e) =>
                        setNewContent({ ...newContent, tags: e.target.value })
                      }
                      placeholder="anxiety, meditation, breathing..."
                    />
                  </div>

                  <div>
                    <Label>Share with Patients (optional)</Label>
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                      {mockPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`patient-${patient.id}`}
                            checked={newContent.patientIds.includes(patient.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewContent({
                                  ...newContent,
                                  patientIds: [
                                    ...newContent.patientIds,
                                    patient.id,
                                  ],
                                });
                              } else {
                                setNewContent({
                                  ...newContent,
                                  patientIds: newContent.patientIds.filter(
                                    (id) => id !== patient.id
                                  ),
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`patient-${patient.id}`}>
                            {patient.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateContent}>Add Content</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                  <Input
                    placeholder="Search content by title, description, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabs and Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Content</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
              <TabsTrigger value="unshared">Not Shared</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredContent.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Upload className="w-12 h-12 text-text-muted mx-auto mb-4" />
                    <p className="text-text-muted">
                      No content found matching your criteria.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredContent.map((item) => (
                    <Card
                      key={item.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${getTypeColor(
                                item.type
                              )}`}
                            >
                              {getTypeIcon(item.type)}
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg line-clamp-1">
                                {item.title}
                              </CardTitle>
                              <Badge className={getTypeColor(item.type)}>
                                {item.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteContent(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-text-muted text-sm mb-4 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="space-y-3">
                          {item.patientIds.length > 0 && (
                            <div>
                              <Label className="text-xs text-text-muted">
                                Shared with:
                              </Label>
                              <div className="flex items-center gap-1 mt-1">
                                <Users className="w-4 h-4 text-text-muted" />
                                <span className="text-sm">
                                  {item.patientIds.length} patient
                                  {item.patientIds.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleShareContent(item)}
                            >
                              <Share className="w-4 h-4 mr-1" />
                              Share
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            {item.type === "video" && (
                              <Button variant="outline" size="sm">
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            {item.type === "audio" && (
                              <Button variant="outline" size="sm">
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}
