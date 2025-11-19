// src/pages/Patient/PatientContent.tsx
// (This is a NEW FILE)

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getSharedContentForPatient } from "@/api";
import { ContentItem } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertTriangle,
  FileText,
  Video,
  Music,
  Image,
  Download,
  Library,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helper to get the correct icon
const getTypeIcon = (type: ContentItem["type"]) => {
  switch (type) {
    case "video": return <Video className="w-5 h-5" />;
    case "audio": return <Music className="w-5 h-5" />;
    case "document": return <FileText className="w-5 h-5" />;
    case "image": return <Image className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
};

// Helper for type-specific styling
const getTypeColor = (type: ContentItem["type"]) => {
  switch (type) {
    case "video": return "bg-blue-100 text-blue-800";
    case "audio": return "bg-green-100 text-green-800";
    case "document": return "bg-orange-100 text-orange-800";
    case "image": return "bg-purple-100 text-purple-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

// Reusable card for displaying a content item
const PatientContentCard: React.FC<{ item: ContentItem }> = ({ item }) => {
  return (
    <Card className="shadow-sm flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
            {getTypeIcon(item.type)}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
            <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {item.description}
        </p>
        <div>
          <p className="text-xs text-muted-foreground mb-4">
            Shared by: {item.owner.full_name || item.owner.username} on {format(parseISO(item.created_at), "PPP")}
          </p>
          <Button asChild className="w-full">
            {/* The 'file' field from the serializer is a direct URL */}
            <a href={item.file} target="_blank" rel="noopener noreferrer" download>
              <Download className="w-4 h-4 mr-2" />
              Download / View
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// The main page component
const PatientContent: React.FC = () => {
  const { data: content, isLoading, isError, error } = useQuery<ContentItem[]>({
    queryKey: ["sharedContent"],
    queryFn: getSharedContentForPatient,
  });

  return (
    <div className="p-6">
      <Card className="mb-8 shadow-sm bg-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Library className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold">My Library</CardTitle>
              <CardDescription className="mt-1">
                Content and resources shared with you by your providers.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {(error as Error).message || "Could not load shared content."}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && (
        <>
          {content && content.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {content.map((item) => (
                <PatientContentCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card className="mt-6 bg-card border border-dashed">
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  No Content Shared
                </h3>
                <p className="text-muted-foreground text-sm">
                  Your provider has not shared any content with you yet.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default PatientContent;