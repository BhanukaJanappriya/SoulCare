import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Gamepad2, Brain, Activity, Clock, Calculator, Grid3X3 } from "lucide-react";
import { useMutation } from '@tanstack/react-query';
import { exportGameDataAPI } from '@/api';
import { useToast } from '@/hooks/use-toast';

// Configuration for available games
const games = [
    { id: 'reaction-time', name: 'Reaction Time', description: 'Response speed metrics', icon: Clock, color: 'text-blue-500 bg-blue-50' },
    { id: 'memory-game', name: 'Memory Matrix', description: 'Pattern recall scores', icon: Brain, color: 'text-purple-500 bg-purple-50' },
    { id: 'stroop-game', name: 'Stroop Test', description: 'Cognitive interference data', icon: Activity, color: 'text-green-500 bg-green-50' },
    { id: 'longest-number', name: 'Number Recall', description: 'Digit span capacity', icon: Gamepad2, color: 'text-orange-500 bg-orange-50' },
    { id: 'numpuz-game', name: 'NumPuz', description: 'Sliding puzzle logic metrics', icon: Grid3X3, color: 'text-indigo-500 bg-indigo-50' },
    { id: 'additions-game', name: 'Speed Math', description: 'Arithmetic processing speed', icon: Calculator, color: 'text-red-500 bg-red-50' },
];

const ManageGameDataPage: React.FC = () => {
    const { toast } = useToast();

    const downloadMutation = useMutation({
        mutationFn: exportGameDataAPI,
        onSuccess: () => {
            toast({ title: "Download Started", description: "Your CSV file is being downloaded." });
        },
        onError: () => {
            toast({ variant: "destructive", title: "Download Failed", description: "Could not export data." });
        }
    });

    const handleDownload = (gameId: string) => {
        downloadMutation.mutate(gameId);
    };

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Game Data Export</h1>
                <p className="text-muted-foreground mt-1">Download raw patient performance metrics for analysis.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => {
                    const Icon = game.icon;
                    return (
                        <Card key={game.id} className="hover:shadow-md transition-all border-muted/60">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className={`p-3 rounded-xl ${game.color} mb-4 inline-block`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    {/* Optional: Add stats badge later */}
                                </div>
                                <CardTitle className="text-xl">{game.name}</CardTitle>
                                <CardDescription>{game.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button 
                                    variant="outline" 
                                    className="w-full gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                                    onClick={() => handleDownload(game.id)}
                                    disabled={downloadMutation.isPending}
                                >
                                    <Download className="w-4 h-4" />
                                    Export CSV
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default ManageGameDataPage;

