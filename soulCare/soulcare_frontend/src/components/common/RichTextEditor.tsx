// src/components/common/RichTextEditor.tsx (UPDATED for basic functionality)

import React, { useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, Link, Heading1, Heading2Icon, List, Image, Code, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder = "Start writing your blog post content..." }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    // Sync React state (value) with the editable div's innerHTML
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
             // Only update if content is different to prevent cursor jump issues
             if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value;
             }
        }
    }, [value]);

    // Handle changes from the user typing in the editable div
    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    // Core function to execute a formatting command
    const execCommand = (command: string, value: string | null = null) => {
        document.execCommand(command, false, value);
        // Fire the onChange event manually after formatting is applied
        handleInput();
    };

    // Placeholder for more complex actions
    const insertLink = () => {
        const url = prompt("Enter the URL:");
        if (url) {
            execCommand('createLink', url);
        }
    };

    // Placeholder for image/media (requires file upload logic, but we can mock the command)
    const insertMedia = () => {
        alert("In a real app, this would open a file upload modal. For now, try bolding text!");
        // execCommand('insertImage', imageUrl); // Actual command for image insertion
    };

    // Placeholder for headings (using formatBlock)
    const toggleHeading = (tag: string) => {
        execCommand('formatBlock', tag);
    };

    return (
        <div className="border rounded-lg">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
                <Button type="button" variant="ghost" size="sm" onClick={() => toggleHeading('H1')} title="Heading 1">
                    <Heading1 className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => toggleHeading('H2')} title="Heading 2">
                    <Heading2 className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 mx-2" />
                <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('bold')} title="Bold">
                    <Bold className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('italic')} title="Italic">
                    <Italic className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('underline')} title="Underline">
                    <Underline className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 mx-2" />
                <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('insertUnorderedList')} title="Unordered List">
                    <List className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={insertLink} title="Insert Link">
                    <Link className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={insertMedia} title="Insert Image">
                    <Image className="w-4 h-4" />
                </Button>
            </div>

            {/* Content Editable Area */}
            <div
                ref={editorRef}
                className="min-h-[200px] p-4 focus:outline-none"
                contentEditable={true}
                onInput={handleInput}
                data-placeholder={placeholder}
                style={{
                    // Simple styling to make it look like a Textarea
                    resize: 'vertical',
                    overflow: 'auto',
                    backgroundColor: 'white',
                }}
            />
        </div>
    );
};

export default RichTextEditor;
