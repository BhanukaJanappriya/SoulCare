// src/components/dialogs/JournalEntryDialog.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { createJournalEntryAPI, updateJournalEntryAPI } from "@/api";
import { JournalEntry, JournalFormData } from "@/types";
import { useToast } from "@/hooks/use-toast";

// --- Import UI Components ---
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

// --- Imports for the Emoji Picker ---
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// 1. Define the validation schema with Zod
const journalFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters long." }),
  mood_emoji: z.string().optional(),
});

// ✅ FIX: Define the form type based on the schema
type JournalFormValues = z.infer<typeof journalFormSchema>;

// 2. Define the Component Props
interface JournalEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: JournalEntry | null; // Pass the entry to edit, or null to create
  onSuccess: () => void; // A function to call after successful submission
}

export function JournalEntryDialog({ open, onOpenChange, entry, onSuccess }: JournalEntryDialogProps) {
  const { toast } = useToast();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State to control the picker popover

  // ✅ FIX: Use the defined form type
  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: {
      title: "",
      content: "",
      mood_emoji: "",
    },
  });

  // 3. Effect to populate the form when editing
  useEffect(() => {
    if (entry) {
      form.reset({
        title: entry.title,
        content: entry.content,
        mood_emoji: entry.mood_emoji || "",
      });
    } else {
      form.reset({
        title: "",
        content: "",
        mood_emoji: "",
      });
    }
  }, [entry, open, form]);

  // 4. React Query Mutation for API calls
  const mutation = useMutation({
    mutationFn: (data: JournalFormData) => {
      if (entry) {
        return updateJournalEntryAPI(entry.id, data);
      } else {
        return createJournalEntryAPI(data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `Journal entry has been ${entry ? "updated" : "created"}.`,
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: Error) => { // ✅ FIX: Add proper error type
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: error.message || "Could not save the entry. Please try again.",
      });
    },
  });

  // 5. The Submit Handler
  function onSubmit(values: JournalFormValues) {
    // ✅ FIX: Quick fix with type assertion
    const formData = { ...values } as JournalFormData;
    mutation.mutate(formData);
  }

  // Get the current emoji value from the form state to display in the button
  const selectedEmoji = form.watch('mood_emoji');

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
            {/* --- MODIFIED EMOJI PICKER FIELD --- */}
            <FormField
              control={form.control}
              name="mood_emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mood</FormLabel>
                  <FormControl>
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-normal text-left">
                          {selectedEmoji ? (
                            <span className="mr-2 text-lg">{selectedEmoji}</span>
                          ) : (
                            <span className="text-muted-foreground">Select a mood</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-none">
                        <EmojiPicker
                          onEmojiClick={(emojiObject) => {
                            field.onChange(emojiObject.emoji); // Update the form value with the selected emoji
                            setShowEmojiPicker(false); // Close the picker
                          }}
                          emojiStyle={EmojiStyle.NATIVE}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* --- END OF MODIFICATION --- */}
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
