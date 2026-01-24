// src/app/create/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import QuizForm from "../_components/QuizForm";
import Link from "next/link";

export default function CreateQuiz() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quizCode, setQuizCode] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    router.push("/");
    return null;
  }

  const handleQuizCreated = (code: string) => {
    setQuizCode(code);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-teal-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Create Your Quiz</h1>
          <p className="text-gray-600">
            Design a quiz with time-limited questions
          </p>
        </header>

        {quizCode ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Quiz Created Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Share this code with participants:
            </p>
            <div className="bg-gray-100 p-6 rounded-lg mb-6">
              <code className="text-4xl font-bold text-indigo-600 tracking-wider">
                {quizCode}
              </code>
            </div>
            <button
              onClick={() => setQuizCode(null)}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Create Another Quiz
            </button>
            <div className="my-4"></div>
            <Link
              href="/quiz/"
              className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Done
            </Link>
          </div>
        ) : (
          <QuizForm onQuizCreated={handleQuizCreated} />
        )}
      </div>
    </div>
  );
}
