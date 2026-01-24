// src/app/results/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface QuizReport {
  id: string;
  quiz: {
    title: string;
    code: string;
  };
  score: number;
  totalQuestions: number;
  timeTaken: number;
  completedAt: string;
}

export default function ResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<QuizReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (session?.user?.id) {
      fetchResults();
    }
  }, [session, status]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/results?userId=${session?.user?.id}`);
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Quiz Results</h1>
          <p className="text-gray-600">
            View your performance across all quizzes
          </p>
        </header>

        <div className="grid gap-6">
          {reports.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No Results Yet
              </h2>
              <p className="text-gray-600 mb-6">
                Take some quizzes to see your results here!
              </p>
              <button
                onClick={() => router.push("/quiz")}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Take a Quiz
              </button>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {report.quiz.title}
                    </h3>
                    <p className="text-gray-600">Code: {report.quiz.code}</p>
                    <p className="text-sm text-gray-500">
                      Completed:{" "}
                      {new Date(report.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">
                      {report.score}/{report.totalQuestions}
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round((report.score / report.totalQuestions) * 100)}
                      %
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-500">
                  <span>
                    Time taken: {Math.floor(report.timeTaken / 60)}:
                    {(report.timeTaken % 60).toString().padStart(2, "0")}
                  </span>
                  <span>
                    Accuracy:{" "}
                    {Math.round((report.score / report.totalQuestions) * 100)}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
