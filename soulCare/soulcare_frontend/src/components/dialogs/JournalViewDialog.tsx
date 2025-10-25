import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { JournalEntry } from "@/types";
import { format } from 'date-fns';

// Define the props the component will accept
interface JournalViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: JournalEntry | null; // The journal entry to display
}

export function JournalViewDialog({ open, onOpenChange, entry }: JournalViewDialogProps) {
  // If there's no entry passed, don't render anything
  if (!entry) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            {/* Entry Title and Date */}
            <div>
              <DialogTitle className="text-2xl mb-2">{entry.title}</DialogTitle>
              <DialogDescription>
                {format(new Date(entry.created_at), 'EEEE, MMMM d, yyyy')}
              </DialogDescription>
            </div>
            {/* Mood Emoji */}
            <span className="text-4xl ml-4 pt-1">{entry.mood_emoji}</span>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Display Tags if they exist */}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.tags.map(tag => (
                <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
              ))}
            </div>
          )}

          {/* Scrollable area for the main content */}
          <div className="prose prose-sm dark:prose-invert max-w-none max-h-[60vh] overflow-y-auto pr-4">
            {/* The 'whitespace-pre-wrap' class is essential to respect newlines from the textarea */}
            <p className="whitespace-pre-wrap leading-relaxed">{entry.content}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
