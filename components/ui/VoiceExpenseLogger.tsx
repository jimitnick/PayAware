"use client";
import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { createClient } from "@/lib/supabase/server";

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);


interface VoiceLoggerProps {
  userId: string;
}

export default function VoiceExpenseLogger({ userId }: VoiceLoggerProps) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [status, setStatus] = useState("Tap to speak");

  useEffect(() => {
    // 1. Event Listeners for UI Feedback
    vapi.on("call-start", () => {
      setIsSessionActive(true);
      setStatus("Listening...");
    });

    vapi.on("call-end", () => {
      setIsSessionActive(false);
      setStatus("Tap to speak");
    });

    vapi.on("speech-start", () => {
      setStatus("Hearing you...");
    });
    
    // Optional: Real-time transcription feedback
    vapi.on("message", (msg) => {
        if(msg.type === "transcript" && msg.transcriptType === "final") {
            console.log("User said:", msg.transcript);
        }
    });

    return () => {
        vapi.removeAllListeners(); // Cleanup
    };
  }, []);

  const toggleCall = async () => {
    if (isSessionActive) {
      vapi.stop();
    } else {
      // 2. Start the call with your Assistant ID
      await vapi.start("4f06d54a-39a9-400f-8cb6-ba0a0c71f69f",{
        metadata: {
            userId: userId // <--- THIS sends the ID to your backend webhook
        }
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-900 rounded-xl border border-slate-700">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isSessionActive ? "bg-red-500 animate-pulse" : "bg-blue-600"}`}>
        <button onClick={toggleCall} className="w-full h-full text-white">
          {isSessionActive ? "■" : "🎤"}
        </button>
      </div>
      <p className="text-slate-300 font-mono text-sm">{status}</p>
    </div>
  );
}