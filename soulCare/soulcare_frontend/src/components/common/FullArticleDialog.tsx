// src/components/common/FullArticleDialog.tsx (NEW FILE)

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BlogPost } from "@/types";
import { Clock, Calendar, User, Tag } from 'lucide-react';

interface FullArticleDialogProps {
    post: BlogPost | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const FullArticleDialog: React.FC<FullArticleDialogProps> = ({ post, isOpen, onOpenChange }) => {
    if (!post) return null;

    // Convert post.content (which is HTML from the RichTextEditor) into JSX
    const renderHtmlContent = () => {
        // Dangerously setting inner HTML is required for displaying rich text content
        return { __html: post.content };
    };

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold mb-2">{post.title}</DialogTitle>
                    <DialogDescription className="text-lg">{post.excerpt}</DialogDescription>
                    <div className="flex items-center gap-4 text-sm text-text-muted mt-2">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Published: {formatDate(post.publishedAt)}</span>
                        {/* Note: You may need to fetch the author's name separately */}
                        <span className="flex items-center gap-1"><User className="w-4 h-4" /> Author ID: {post.authorId}</span>
                        <span className="flex items-center gap-1"><Tag className="w-4 h-4" /> Tags: {post.tags.join(', ')}</span>
                    </div>
                </DialogHeader>

                <div className="py-4 border-t mt-4 article-content">
                    {/* CRITICAL: Safely rendering HTML content */}
                    <div dangerouslySetInnerHTML={renderHtmlContent()} />
                </div>

                {/* Optional: Add basic styling for rich content */}
                <style>{`
                    .article-content h1 { font-size: 1.5em; margin-top: 1em; margin-bottom: 0.5em; }
                    .article-content h2 { font-size: 1.3em; margin-top: 1em; margin-bottom: 0.5em; }
                    .article-content p { margin-bottom: 1em; }
                    .article-content a { color: blue; text-decoration: underline; }
                `}</style>
            </DialogContent>
        </Dialog>
    );
};

export default FullArticleDialog;
