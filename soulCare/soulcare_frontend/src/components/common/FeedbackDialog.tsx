import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2 } from "lucide-react";
import { useMutation } from '@tanstack/react-query';
import { createFeedbackAPI } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ open, onOpenChange }) => {
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState("");

    const mutation = useMutation({
        mutationFn: createFeedbackAPI,
        onSuccess: () => {
            toast({ title: "Thank You!", description: "Your feedback has been submitted for review." });
            onOpenChange(false);
            setRating(0);
            setContent("");
        },
        onError: () => {
            toast({ variant: "destructive", title: "Error", description: "Failed to submit feedback." });
        }
    });

    const handleSubmit = () => {
        if (rating === 0) {
            toast({ variant: "destructive", title: "Error", description: "Please select a rating." });
            return;
        }
        if (!content.trim()) {
            toast({ variant: "destructive", title: "Error", description: "Please write some feedback." });
            return;
        }
        mutation.mutate({ rating, content });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Give Feedback</DialogTitle>
                    <DialogDescription>
                        Share your experience with SoulCare. Your feedback helps us improve.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={cn(
                                        "w-8 h-8 transition-colors",
                                        (hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="feedback">Your Message</Label>
                        <Textarea
                            id="feedback"
                            placeholder="What did you like? What can we do better?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};