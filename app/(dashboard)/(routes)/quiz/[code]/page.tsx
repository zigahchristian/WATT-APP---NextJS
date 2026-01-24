// src/app/quiz/[code]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import QuizPlayer from "../_components/QuizPlayer";

interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit: number;
  questions: Array<{
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
    points: number;
  }>;
}

export default function QuizPage() {
  const { code } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }

    if (code) {
      fetchQuiz();
    }
  }, [code, status]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quiz?code=${code}`);
      if (!response.ok) {
        throw new Error("Quiz not found");
      }
      const data = await response.json();
      setQuiz(data);
    } catch (err) {
      setError("Quiz not found or expired");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading quiz...</div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {error || "Quiz not found"}
          </h1>
          <button
            onClick={() => router.push("/")}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <QuizPlayer quiz={quiz} userId={session?.user?.id || ""} />
      </div>
    </div>
  );
}
