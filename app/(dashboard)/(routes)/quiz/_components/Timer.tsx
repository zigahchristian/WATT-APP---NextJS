// src/components/Timer.tsx
"use client";

import { useEffect } from "react";

interface TimerProps {
  timeLeft: number;
  setTimeLeft: (time: number) => void;
}

export default function Timer({ timeLeft, setTimeLeft }: TimerProps) {
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, setTimeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeLeft < 30) return "bg-red-100 text-red-700 animate-pulse";
    if (timeLeft < 60) return "bg-orange-100 text-orange-700";
    if (timeLeft < 120) return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold ${getTimerColor()}`}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
}
