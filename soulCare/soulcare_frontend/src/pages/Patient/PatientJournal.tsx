import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Lock,
  Unlock,
  Heart,
  Calendar,
  Tag,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: number;
  isPrivate: boolean;
  tags: string[];
  date: string;
  preview: string;
}

const PatientJournal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: "1",
      title: "A Beautiful Morning",
      content:
        "Today I woke up feeling refreshed and grateful. The sun was shining through my window and I felt a sense of hope that I haven't experienced in a while. I think the meditation practice is really helping...",
      mood: 8,
      isPrivate: false,
      tags: ["gratitude", "morning", "meditation"],
      date: "2024-01-21",
      preview:
        "Today I woke up feeling refreshed and grateful. The sun was shining through my window...",
    },
    {
      id: "2",
      title: "Therapy Session Reflections",
      content:
        "Had my weekly therapy session today. We talked about my coping mechanisms and I realized I've been making more progress than I thought. Dr. Smith helped me see patterns in my thinking that I wasn't aware of...",
      mood: 7,
      isPrivate: true,
      tags: ["therapy", "reflection", "growth"],
      date: "2024-01-20",
      preview:
        "Had my weekly therapy session today. We talked about my coping mechanisms...",
    },
    {
      id: "3",
      title: "Challenging Day at Work",
      content:
        "Work was particularly stressful today. The deadline pressure got to me and I felt that familiar anxiety creeping in. But I remembered the breathing techniques and took a few moments to center myself...",
      mood: 5,
      isPrivate: false,
      tags: ["work", "stress", "anxiety", "coping"],
      date: "2024-01-19",
      preview:
        "Work was particularly stressful today. The deadline pressure got to me...",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // New entry form states
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newMood, setNewMood] = useState([7]);
  const [newIsPrivate, setNewIsPrivate] = useState(false);
  const [newTags, setNewTags] = useState("");

  const allTags = Array.from(new Set(entries.flatMap((entry) => entry.tags)));

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => entry.tags.includes(tag));
    const matchesPrivacy = !showPrivateOnly || entry.isPrivate;

    return matchesSearch && matchesTags && matchesPrivacy;
  });

  const handleCreateEntry = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: newTitle || "Untitled Entry",
      content: newContent,
      mood: newMood[0],
      isPrivate: newIsPrivate,
      tags: newTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      date: new Date().toISOString().split("T")[0],
      preview:
        newContent.substring(0, 100) + (newContent.length > 100 ? "..." : ""),
    };

    setEntries([newEntry, ...entries]);

    // Reset form
    setNewTitle("");
    setNewContent("");
    setNewMood([7]);
    setNewIsPrivate(false);
    setNewTags("");
    setIsNewEntryOpen(false);
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 9) return "😄";
    if (mood >= 7) return "😊";
    if (mood >= 5) return "😐";
    if (mood >= 3) return "😔";
    return "😢";
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return "text-green-500";
    if (mood >= 6) return "text-yellow-500";
    if (mood >= 4) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
    

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="w-8 h-8 text-primary" />
                  My Journal
                </h1>
                <p className="text-muted-foreground">
                  A safe space for your thoughts, feelings, and reflections
                </p>
              </div>

              <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    New Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Journal Entry</DialogTitle>
                    <DialogDescription>
                      Express your thoughts and feelings in a safe, private
                      space
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        placeholder="Give your entry a title..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Content</label>
                      <Textarea
                        placeholder="What's on your mind today? Write freely about your thoughts, feelings, experiences..."
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        rows={8}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Heart className="w-4 h-4 text-rose-500" />
                          How are you feeling? (Optional)
                        </label>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-2xl ${getMoodColor(newMood[0])}`}
                          >
                            {getMoodEmoji(newMood[0])}
                          </span>
                          <span className="text-sm font-medium">
                            {newMood[0]}/10
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={newMood}
                        onValueChange={setNewMood}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Tags (Optional)
                      </label>
                      <Input
                        placeholder="Add tags separated by commas (e.g., gratitude, work, family)"
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {newIsPrivate ? (
                          <Lock className="w-4 h-4 text-red-500" />
                        ) : (
                          <Unlock className="w-4 h-4 text-green-500" />
                        )}
                        <label className="text-sm font-medium">
                          {newIsPrivate ? "Private Entry" : "Shareable Entry"}
                        </label>
                      </div>
                      <Switch
                        checked={newIsPrivate}
                        onCheckedChange={setNewIsPrivate}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleCreateEntry} className="flex-1">
                        Save Entry
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsNewEntryOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Switch
                    checked={showPrivateOnly}
                    onCheckedChange={setShowPrivateOnly}
                  />
                  <span className="text-sm text-muted-foreground">
                    Private only
                  </span>
                </div>
              </div>

              {allTags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={
                          selectedTags.includes(tag) ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedTags((prev) =>
                            prev.includes(tag)
                              ? prev.filter((t) => t !== tag)
                              : [...prev, tag]
                          );
                        }}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Entries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="hover-scale cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {entry.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      {entry.isPrivate && (
                        <Lock className="w-4 h-4 text-red-500" />
                      )}
                      {entry.mood && (
                        <span className={`text-lg ${getMoodColor(entry.mood)}`}>
                          {getMoodEmoji(entry.mood)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {entry.preview}
                  </p>

                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {entry.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{entry.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Read
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEntries.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No entries found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {entries.length === 0
                    ? "Start your journaling journey by creating your first entry"
                    : "Try adjusting your search or filter criteria"}
                </p>
                <Button onClick={() => setIsNewEntryOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Entry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Entry Detail Modal */}
          {selectedEntry && (
            <Dialog
              open={!!selectedEntry}
              onOpenChange={() => setSelectedEntry(null)}
            >
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-2xl">
                        {selectedEntry.title}
                      </DialogTitle>
                      <DialogDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(selectedEntry.date).toLocaleDateString()}
                        </span>
                        {selectedEntry.mood && (
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-rose-500" />
                            <span className={getMoodColor(selectedEntry.mood)}>
                              {getMoodEmoji(selectedEntry.mood)}{" "}
                              {selectedEntry.mood}/10
                            </span>
                          </span>
                        )}
                        {selectedEntry.isPrivate && (
                          <span className="flex items-center gap-1 text-red-500">
                            <Lock className="w-4 h-4" />
                            Private
                          </span>
                        )}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {selectedEntry.content}
                    </div>
                  </div>

                  {selectedEntry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientJournal;
