// src/pages/Patient/PatientJournal.tsx

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getJournalEntriesAPI,
  deleteJournalEntryAPI,
  getJournalTagsAPI,
  downloadJournalsAPI
} from '@/api';
import { JournalEntry, Tag } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// --- Import UI Components (you likely have these) ---
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { JournalEntryDialog } from '@/components/dialogs/JournalEntryDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { BookOpen, Search, Plus, Trash2, Pencil, Download } from 'lucide-react';


export default function PatientJournal() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // State for managing UI
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState<JournalEntry | null>(null);


    // --- React Query Hooks for Data Fetching and Mutations ---

    // 1. Fetch journal entries
    const { data: entries, isLoading: isLoadingEntries } = useQuery<JournalEntry[]>({
        queryKey: ['journalEntries', { q: searchTerm, tags: selectedTags.join(',') }],
        queryFn: () => getJournalEntriesAPI({ q: searchTerm, tags: selectedTags.join(',') }),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // 2. Fetch available tags
    const { data: availableTags, isLoading: isLoadingTags } = useQuery<Tag[]>({
        queryKey: ['journalTags'],
        queryFn: getJournalTagsAPI,
    });

    // 3. Mutation for deleting an entry
    const deleteMutation = useMutation({
        mutationFn: deleteJournalEntryAPI,
        onSuccess: () => {
            toast({ title: "Success", description: "Journal entry deleted." });
            queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
            queryClient.invalidateQueries({ queryKey: ['journalTags'] }); // Tags might change
        },
        onError: () => {
            toast({ variant: "destructive", title: "Error", description: "Could not delete entry." });
        },
    });

    // 4. Mutation for downloading
    const downloadMutation = useMutation({
        mutationFn: downloadJournalsAPI,
        onSuccess: () => {
            toast({ title: "Success", description: "Your journal download has started." });
        },
        onError: () => {
             toast({ variant: "destructive", title: "Error", description: "Could not download journal." });
        }
    });

    // --- Event Handlers ---

    const handleTagClick = (tagName: string) => {
        setSelectedTags(prev =>
            prev.includes(tagName)
                ? prev.filter(t => t !== tagName)
                : [...prev, tagName]
        );
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
    }

    const openNewDialog = () => {
        setEntryToEdit(null);
        setIsFormDialogOpen(true);
    }


    return (
        <div className="container mx-auto px-6 py-8">
            <header className="mb-8">
                <div className="flex items-center mb-2">
                    <BookOpen className="w-8 h-8 text-primary mr-3" />
                    <h1 className="text-3xl font-bold text-text-dark">My Journal</h1>
                </div>
                <p className="text-text-muted">A safe space for your thoughts, feelings, and reflections</p>
            </header>

            <div className="flex justify-between items-center mb-6">
                <Button onClick={openNewDialog}>
                    <Plus className="w-4 h-4 mr-2" /> New Entry
                </Button>
                <Button variant="outline" onClick={() => downloadMutation.mutate()} disabled={downloadMutation.isPending}>
                    <Download className="w-4 h-4 mr-2" />
                    {downloadMutation.isPending ? 'Downloading...' : 'Download as Document'}
                </Button>
            </div>

            <Card className="mb-6">
                <CardContent className="p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Search entries..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {isLoadingTags ? <p>Loading tags...</p> :
                            availableTags?.map(tag => (
                                <Badge
                                    key={tag.id}
                                    variant={selectedTags.includes(tag.name) ? 'default' : 'secondary'}
                                    onClick={() => handleTagClick(tag.name)}
                                    className="cursor-pointer"
                                >
                                    {tag.name}
                                </Badge>
                            ))
                        }
                    </div>
                </CardContent>
            </Card>

            {/* Journal Entries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingEntries ? (
                    <p>Loading your journal...</p>
                ) : entries && entries.length > 0 ? (
                    entries.map(entry => (
                        <Card key={entry.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                                    <span className="text-2xl">{entry.mood_emoji}</span>
                                </div>
                                <CardDescription>
                                    {format(new Date(entry.created_at), 'MMMM d, yyyy')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                                <p className="text-text-muted text-sm line-clamp-3">
                                    {entry.content}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {entry.tags.map(tag => (
                                        <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <div className="p-4 border-t flex justify-between items-center">
                                <Button variant="ghost" className="flex-1 justify-start">Read</Button>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => openEditDialog(entry)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirmDelete(entry.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <p>No journal entries found. Why not create one?</p>
                )}
            </div>

            {/* Dialog for Add/Edit Form */}
            <JournalEntryDialog
                open={isFormDialogOpen}
                onOpenChange={setIsFormDialogOpen}
                entry={entryToEdit}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
                    queryClient.invalidateQueries({ queryKey: ['journalTags'] });
                }}
            />

            {/* Alert Dialog for Deletion Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your journal entry.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
