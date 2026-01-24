// src/app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [quizCode, setQuizCode] = useState("");

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (quizCode.trim()) {
      router.push(`/quiz/${quizCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <main className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Take a Quiz
            </h2>
            <p className="text-gray-600 mb-6">
              Enter a quiz code to start testing your knowledge with
              time-limited questions.
            </p>
            <form onSubmit={handleStartQuiz} className="space-y-4">
              <input
                type="text"
                placeholder="Enter Quiz Code (e.g., ABC123)"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-lg font-mono uppercase tracking-wider"
                required
                pattern="[A-Z0-9]{6}"
                maxLength={6}
                title="Enter a 6-character quiz code"
              />
              <button
                type="submit"
                className="block w-full bg-indigo-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!quizCode.trim()}
              >
                Start Quiz
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Create a Quiz
            </h2>
            <p className="text-gray-600 mb-6">
              Design your own quiz with multiple-choice questions and set time
              limits.
            </p>
            <Link
              href="/quiz/create"
              className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Create New Quiz
            </Link>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              View Results
            </h2>
            <p className="text-gray-600 mb-6">
              Check your previous quiz performances and scores.
            </p>
            <Link
              href="/quiz/results"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              View My Results
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
