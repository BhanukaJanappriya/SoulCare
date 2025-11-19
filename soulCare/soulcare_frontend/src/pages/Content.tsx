// src/pages/Content.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RightSidebar } from "@/components/layout/RightSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Search,
  Upload,
  Share,
  Edit,
  Trash2,
  FileText,
  Video,
  Music,
  Image,
  Eye,
  Users,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ContentItem,
  ContentFormData,
  PatientOption,
  BasicUserInfo,
} from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getContentItems,
  createContentItem,
  deleteContentItem,
  shareContentItem,
  getDoctorPatients, // We need this for the Share dialog
} from "@/api";
import { format, parseISO } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- Helper Functions (from your original file) ---

const getTypeIcon = (type: ContentItem["type"]) => {
  switch (type) {
    case "video": return <Video className="w-5 h-5" />;
    case "audio": return <Music className="w-5 h-5" />;
    case "document": return <FileText className="w-5 h-5" />;
    case "image": return <Image className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
};

const getTypeColor = (type: ContentItem["type"]) => {
  switch (type) {
    case "video": return "bg-blue-100 text-blue-800";
    case "audio": return "bg-green-100 text-green-800";
    case "document": return "bg-orange-100 text-orange-800";
    case "image": return "bg-purple-100 text-purple-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

// --- 1. Add Content Dialog Component ---

interface AddContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddContentDialog: React.FC<AddContentDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ContentItem["type"]>("document");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const createMutation = useMutation({
    mutationFn: createContentItem,
    onSuccess: () => {
      toast({ title: "Success", description: "Content uploaded successfully." });
      queryClient.invalidateQueries({ queryKey: ["contentItems"] });
      onOpenChange(false);
      // Reset form
      setTitle("");
      setDescription("");
      setType("document");
      setTags("");
      setFile(null);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: (error as Error).message || "Could not upload content.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!title || !file) {
      toast({
        title: "Validation Error",
        description: "Title and File are required.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({
      title,
      description,
      type,
      file,
      tags,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Content</DialogTitle>
          <DialogDescription>
            Upload a new file to your library to share with patients.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., CBT Worksheet"
              />
            </div>
            <div>
              <Label htmlFor="type">Content Type *</Label>
              <Select
                value={type}
                onValueChange={(value: ContentItem["type"]) => setType(value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document (PDF, Docx)</SelectItem>
                  <SelectItem value="video">Video (MP4)</SelectItem>
                  <SelectItem value="audio">Audio (MP3)</SelectItem>
                  <SelectItem value="image">Image (JPG, PNG)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the content and its purpose..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="file-upload">File *</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="file:text-primary file:font-medium"
            />
            {file && <p className="text-sm text-muted-foreground mt-2">Selected: {file.name}</p>}
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="anxiety, meditation, worksheet..."
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Upload Content
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- 2. Share Content Dialog Component ---

interface ShareContentDialogProps {
  item: ContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShareContentDialog: React.FC<ShareContentDialogProps> = ({ item, open, onOpenChange }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State to hold the list of *currently* selected patient IDs
  const [selectedPatientIds, setSelectedPatientIds] = useState<Set<number>>(new Set());

  // Fetch the provider's full patient list
  const { data: patients, isLoading: isLoadingPatients } = useQuery<PatientOption[]>({
    queryKey: ["doctorPatients"],
    queryFn: getDoctorPatients,
  });

  // When the dialog opens (when 'item' changes),
  // pre-populate the 'selectedPatientIds' state from the item's 'shared_with' list
  useEffect(() => {
    if (item) {
      setSelectedPatientIds(new Set(item.shared_with.map(p => p.id)));
    }
  }, [item]);

  const shareMutation = useMutation({
    mutationFn: shareContentItem,
    onSuccess: (updatedItem) => {
      toast({ title: "Success", description: "Sharing settings updated." });
      // Update the cache immediately to reflect the new 'shared_with' list
      queryClient.setQueryData<ContentItem[]>(['contentItems'], (oldData) => 
        oldData?.map(oldItem => oldItem.id === updatedItem.id ? updatedItem : oldItem) || []
      );
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message || "Could not update sharing.",
        variant: "destructive",
      });
    },
  });

  const handleTogglePatient = (patientId: number, checked: boolean) => {
    setSelectedPatientIds(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(patientId);
      } else {
        next.delete(patientId);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (!item) return;
    const patientIds = Array.from(selectedPatientIds);
    shareMutation.mutate({ id: item.id, patientIds });
  };
  
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{item.title}"</DialogTitle>
          <DialogDescription>
            Select the patients you want to share this content with.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoadingPatients ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-48 border rounded-md p-4">
              <div className="space-y-3">
                {patients?.map((patient) => (
                  <div key={patient.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`share-${patient.id}`}
                      checked={selectedPatientIds.has(patient.id)}
                      onCheckedChange={(checked) => handleTogglePatient(patient.id, !!checked)}
                    />
                    <Label htmlFor={`share-${patient.id}`} className="font-normal">
                      {patient.full_name} - {patient.nic}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={shareMutation.isPending}>
            {shareMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- 3. Delete Confirmation Dialog Component ---

interface DeleteContentDialogProps {
  item: ContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteContentDialog: React.FC<DeleteContentDialogProps> = ({ item, open, onOpenChange }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteContentItem,
    onSuccess: (_, deletedItemId) => {
      toast({ title: "Success", description: "Content item deleted." });
      // Optimistically remove from the cache
      queryClient.setQueryData<ContentItem[]>(['contentItems'], (oldData) =>
        oldData?.filter(item => item.id !== deletedItemId) || []
      );
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message || "Could not delete item.",
        variant: "destructive",
      });
    },
  });

  const handleConfirmDelete = () => {
    if (item) {
      deleteMutation.mutate(item.id);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete "{item?.title}". Patients it is shared with
            will no longer be able to access it. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// --- 4. Content Card Component ---

interface ContentCardProps {
  item: ContentItem;
  onShare: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, onShare, onDelete }) => {
  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
              {getTypeIcon(item.type)}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
              <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" asChild>
              <a href={item.file} target="_blank" rel="noopener noreferrer">
                <Eye className="w-4 h-4" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(item)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {item.description}
          </p>
          <div className="flex flex-wrap gap-1 mb-4">
            {item.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {item.shared_with.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Shared with:</Label>
              <div className="flex items-center gap-1 mt-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {item.shared_with.length} patient
                  {item.shared_with.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onShare(item)}
          >
            <Share className="w-4 h-4 mr-1" />
            Manage Sharing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};


// --- 5. Main Content Page Component ---

export default function Content() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // --- Dialog State ---
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [itemToShare, setItemToShare] = useState<ContentItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null);

  // --- Data Fetching ---
  const { data: content, isLoading: isLoadingContent, isError, error } = useQuery<ContentItem[]>({
    queryKey: ["contentItems"],
    queryFn: getContentItems,
  });

  // --- Filtering Logic ---
  const filteredContent = useMemo(() => {
    if (!content) return [];
    return content.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesType = selectedType === "all" || item.type === selectedType;
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "shared" && item.shared_with.length > 0) ||
        (activeTab === "unshared" && item.shared_with.length === 0);

      return matchesSearch && matchesType && matchesTab;
    });
  }, [content, searchTerm, selectedType, activeTab]);

  return (
    <div className="min-h-screen bg-background text-foreground pr-[5.5rem]">
      <RightSidebar />
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Content Library
            </h1>
            <p className="text-muted-foreground">
              Manage and share therapeutic content with your patients
            </p>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Content
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search content by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-48">
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
            {isLoadingContent ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {(error as Error).message || "Could not load content."}
                </AlertDescription>
              </Alert>
            ) : filteredContent.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="text-center py-12">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No content found matching your criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    onShare={setItemToShare}
                    onDelete={setItemToDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddContentDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      
      <ShareContentDialog
        item={itemToShare}
        open={!!itemToShare}
        onOpenChange={() => setItemToShare(null)}
      />
      
      <DeleteContentDialog
        item={itemToDelete}
        open={!!itemToDelete}
        onOpenChange={() => setItemToDelete(null)}
      />

    </div>
  );
}