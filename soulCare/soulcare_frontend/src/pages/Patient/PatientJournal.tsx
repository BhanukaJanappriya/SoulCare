// src/pages/Patient/PatientJournal.tsx

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getJournalEntriesAPI,
  deleteJournalEntryAPI,
  getJournalTagsAPI,
  downloadJournalsAPI,
  shareJournalEntryAPI,
} from "@/api";
import { JournalEntry, Tag } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { JournalEntryDialog } from "@/components/dialogs/JournalEntryDialog";
import { JournalViewDialog } from "@/components/dialogs/JournalViewDialog";
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
  BookOpen,
  Search,
  Plus,
  Trash2,
  Pencil,
  Download,
  Share2,
} from "lucide-react";

// Type definitions
interface ApiError {
  response?: {
    data?: {
      detail?: string;
      [key: string]: unknown;
    };
  };
  message?: string;
}

type TimeFilter = "all" | "weekly" | "monthly";

export default function PatientJournal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<JournalEntry | null>(null);
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [entryToView, setEntryToView] = useState<JournalEntry | null>(null);

  // --- React Query Hooks ---

  // 1. Fetch journal entries with filtering
  const { data: entries, isLoading: isLoadingEntries } = useQuery<
    JournalEntry[]
  >({
    queryKey: [
      "journalEntries",
      {
        q: searchTerm,
        tags: selectedTags.join(","),
        filter: activeFilter,
      },
    ],
    queryFn: () =>
      getJournalEntriesAPI({
        q: searchTerm,
        tags: selectedTags.join(","),
        filter: activeFilter === "all" ? undefined : activeFilter,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // 2. Fetch available tags
  const { data: availableTags, isLoading: isLoadingTags } = useQuery<Tag[]>({
    queryKey: ["journalTags"],
    queryFn: getJournalTagsAPI,
  });

  // 3. Mutation for deleting an entry
  const deleteMutation = useMutation({
    mutationFn: deleteJournalEntryAPI,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Journal entry deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      queryClient.invalidateQueries({ queryKey: ["journalTags"] });
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Could not delete entry.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    },
  });

  // 4. Mutation for downloading journals
  const downloadMutation = useMutation({
    mutationFn: downloadJournalsAPI,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your journal download has started.",
      });
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Could not download journal.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    },
  });

  // 5. Mutation for sharing entries
  const shareMutation = useMutation({
    mutationFn: shareJournalEntryAPI,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.detail || "Journal entry shared successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Could not share the entry.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    },
  });

  const handleReadEntry = (entry: JournalEntry) => {
    setEntryToView(entry);
    setIsViewDialogOpen(true);
  };

  // --- Event Handlers ---

  const handleTagClick = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleFilterChange = (value: string) => {
    if (value === "all" || value === "weekly" || value === "monthly") {
      setActiveFilter(value);
    }
  };

  const confirmDelete = (id: number) => {
    setEntryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (entryToDelete) {
      deleteMutation.mutate(entryToDelete);
    }
    setIsDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  const openEditDialog = (entry: JournalEntry) => {
    setEntryToEdit(entry);
    setIsFormDialogOpen(true);
  };

  const openNewDialog = () => {
    setEntryToEdit(null);
    setIsFormDialogOpen(true);
  };

  const handleShareEntry = (entryId: number) => {
    shareMutation.mutate(entryId);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <header className="mb-8">
        <Card className="shadow-sm bg-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl font-bold">My Journal</CardTitle>
                <CardDescription className="mt-1">
                  A safe space for your thoughts, feelings, and reflections
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
        <p className="text-text-muted"></p>
      </header>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <Button onClick={openNewDialog}>
          <Plus className="w-4 h-4 mr-2" /> New Entry
        </Button>
        <Button
          variant="outline"
          onClick={() => downloadMutation.mutate()}
          disabled={downloadMutation.isPending}
        >
          <Download className="w-4 h-4 mr-2" />
          {downloadMutation.isPending
            ? "Downloading..."
            : "Download as Document"}
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-8">
        <CardContent className="p-4 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search entries..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter and Tags Section */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Tags Filter */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-muted-foreground">
                Filter by tag:
              </span>
              {isLoadingTags ? (
                <p className="text-sm text-muted-foreground">Loading tags...</p>
              ) : availableTags && availableTags.length > 0 ? (
                availableTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={
                      selectedTags.includes(tag.name) ? "default" : "secondary"
                    }
                    onClick={() => handleTagClick(tag.name)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {tag.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground italic">
                  No tags available
                </span>
              )}
            </div>

            {/* Time Filter */}
            <ToggleGroup
              type="single"
              value={activeFilter}
              onValueChange={handleFilterChange}
            >
              <ToggleGroupItem value="all" aria-label="All time">
                All
              </ToggleGroupItem>
              <ToggleGroupItem value="weekly" aria-label="Last 7 days">
                Weekly
              </ToggleGroupItem>
              <ToggleGroupItem value="monthly" aria-label="Last 30 days">
                Monthly
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      {/* Journal Entries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingEntries ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Loading your journal...</p>
          </div>
        ) : entries && entries.length > 0 ? (
          entries.map((entry) => (
            <Card
              key={entry.id}
              className="flex flex-col hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg leading-tight">
                    {entry.title}
                  </CardTitle>
                  <span className="text-2xl ml-2">{entry.mood_emoji}</span>
                </div>
                <CardDescription className="text-xs">
                  {format(new Date(entry.created_at), "MMMM d, yyyy")}
                </CardDescription>

                {/* Sharing Status Badge */}
                {entry.shared_with_counselor && (
                  <Badge variant="secondary" className="w-fit mt-2 text-xs">
                    Shared with {entry.shared_with_counselor.full_name}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex-grow space-y-4 pb-4">
                <p className="text-text-muted text-sm line-clamp-3 leading-relaxed">
                  {entry.content}
                </p>
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <div className="p-4 border-t flex justify-between items-center bg-muted/20">
                {/* Read Full Entry Button - Left Side */}
                <div className="flex-1">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-left"
                    onClick={() => handleReadEntry(entry)}
                  >
                    Read Full Entry
                  </Button>
                </div>

                {/* Action Buttons - Right Side */}
                <div className="flex gap-1">
                  {/* Share Button - Only show if not already shared */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEditDialog(entry)}
                    className="h-8 w-8"
                    title="Edit entry"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive h-8 w-8"
                    onClick={() => confirmDelete(entry.id)}
                    title="Delete entry"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-dark mb-2">
              No journal entries found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedTags.length > 0 || activeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start your journaling journey by creating your first entry"}
            </p>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" />
              {searchTerm || selectedTags.length > 0 || activeFilter !== "all"
                ? "Clear Filters and Create Entry"
                : "Create Your First Entry"}
            </Button>
          </div>
        )}
      </div>

      {/* Journal Entry Dialog */}
      <JournalEntryDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        entry={entryToEdit}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
          queryClient.invalidateQueries({ queryKey: ["journalTags"] });
        }}
      />
      <JournalViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        entry={entryToView}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              journal entry and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEntryToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Entry"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
