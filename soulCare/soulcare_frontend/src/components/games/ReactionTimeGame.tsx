import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Using your shadcn UI
import { Button } from "@/components/ui/button";

const ReactionTimeGame: React.FC = () => {
  const [gameState, setGameState] = useState<
    "start" | "waiting" | "ready" | "finished"
  >("start");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  // Use a ref for the timeout so we can clear it if the user clicks too early
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setGameState("waiting");
    setReactionTime(null);

    // Random delay between 2 and 5 seconds
    const delay = Math.floor(Math.random() * 3000) + 2000;

    timeoutRef.current = setTimeout(() => {
      setGameState("ready");
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (gameState === "waiting") {
      // User clicked too early (fail state)
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      alert("Too early! Wait for green.");
      setGameState("start");
      return;
    }

    if (gameState === "ready") {
      const endTime = Date.now();
      const duration = endTime - startTime;
      setReactionTime(duration);
      setGameState("finished");

      // SEND DATA TO BACKEND HERE
      saveResultToBackend(duration);
    }
  };

  const saveResultToBackend = async (score: number) => {
    try {
      // Replace with your actual token retrieval logic (e.g., localStorage)
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/games/save-result/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            game_type: "reaction_time",
            score: score,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save");
      console.log("Score saved to Matrix!");
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Reaction Time Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          onClick={handleClick}
          className={`
            h-64 w-full rounded-lg flex items-center justify-center cursor-pointer transition-colors text-2xl font-bold select-none
            ${gameState === "start" ? "bg-gray-200 text-gray-700" : ""}
            ${gameState === "waiting" ? "bg-red-500 text-white" : ""}
            ${gameState === "ready" ? "bg-green-500 text-white" : ""}
            ${gameState === "finished" ? "bg-blue-100 text-blue-800" : ""}
          `}
        >
          {gameState === "start" && "Click to Start"}
          {gameState === "waiting" && "Wait for Green..."}
          {gameState === "ready" && "CLICK NOW!"}
          {gameState === "finished" && `${reactionTime} ms`}
        </div>

        {gameState === "finished" && (
          <Button onClick={startGame} className="mt-4 w-full">
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ReactionTimeGame;
