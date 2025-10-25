// src/components/dialogs/JournalEntryDialog.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { createJournalEntryAPI, updateJournalEntryAPI } from "@/api";
import { JournalEntry, JournalFormData } from "@/types";
import { useToast } from "@/hooks/use-toast";

// --- Import ShadCN UI Components ---
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// --- 1. Define the validation schema with Zod ---
const journalFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters long." }),
  mood_emoji: z.string().optional(),
  // We'll handle tags separately for simplicity, but you could add them here too
});

// Define the form type based on the schema
type JournalFormValues = z.infer<typeof journalFormSchema>;

// --- 2. Define the Component Props ---
interface JournalEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: JournalEntry | null; // Pass the entry to edit, or null to create
  onSuccess: () => void; // A function to call after successful submission
}

export function JournalEntryDialog({ open, onOpenChange, entry, onSuccess }: JournalEntryDialogProps) {
  const { toast } = useToast();
  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: {
      title: "",
      content: "",
      mood_emoji: "",
    },
  });

  // --- 3. Effect to populate the form when editing ---
  useEffect(() => {
    if (entry) {
      // If we are editing, reset the form with the entry's data
      form.reset({
        title: entry.title,
        content: entry.content,
        mood_emoji: entry.mood_emoji || "",
      });
    } else {
      // If we are creating, reset to default empty values
      form.reset({
        title: "",
        content: "",
        mood_emoji: "",
      });
    }
  }, [entry, open, form]); // Rerun when the dialog opens or the entry changes

  // --- 4. React Query Mutation for API calls ---
  const mutation = useMutation({
    mutationFn: (data: JournalFormData) => {
      if (entry) {
        // If an entry exists, we're updating
        return updateJournalEntryAPI(entry.id, data);
      } else {
        // Otherwise, we're creating
        return createJournalEntryAPI(data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `Journal entry has been ${entry ? "updated" : "created"}.`,
      });
      onSuccess(); // This will refetch the journal entries
      onOpenChange(false); // Close the dialog
    },
    onError: (error: Error) => { // ✅ Add proper error type
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: error.message || "Could not save the entry. Please try again.",
      });
    },
  });

  // --- 5. The Submit Handler ---
  function onSubmit(values: JournalFormValues) {
    // ✅ FIX: Convert form values to JournalFormData with required fields
    const formData: JournalFormData = {
      title: values.title,
      content: values.content,
      mood_emoji: values.mood_emoji || undefined, // Convert empty string to undefined
    };
    mutation.mutate(formData);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Journal Entry" : "Create New Entry"}</DialogTitle>
          <DialogDescription>
            {entry ? "Make changes to your entry here." : "Add a new thought or reflection."} Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., A Beautiful Morning" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your thoughts and feelings here..."
                      className="resize-none"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="mood_emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mood Emoji (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 😊" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
