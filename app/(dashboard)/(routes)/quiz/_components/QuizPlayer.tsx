// src/components/QuizPlayer.tsx
"use client";

import { useState, useEffect } from "react";
import Timer from "./Timer";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface QuizPlayerProps {
  quiz: {
    id: string;
    title: string;
    description?: string;
    timeLimit: number;
    questions: Question[];
  };
  userId: string;
}

export default function QuizPlayer({ quiz, userId }: QuizPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(
    Array(quiz.questions.length).fill(-1),
  );
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    let totalScore = 0;
    answers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) {
        totalScore += quiz.questions[index].points;
      }
    });

    setScore(totalScore);
    setIsSubmitted(true);

    // Submit results to API
    await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId: quiz.id,
        userId,
        answers,
        timeTaken: quiz.timeLimit - timeLeft,
        score: totalScore,
        totalQuestions: quiz.questions.length,
      }),
    });
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Quiz Completed!
        </h2>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
          <div className="text-4xl font-bold text-indigo-600 mb-2">
            {score}/{quiz.questions.reduce((a, q) => a + q.points, 0)}
          </div>
          <div className="text-gray-600">Your Score</div>
        </div>
        <p className="text-gray-600">Thanks for taking the quiz!</p>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
          <Timer timeLeft={timeLeft} setTimeLeft={setTimeLeft} />
        </div>
        <p className="text-gray-600 mb-2">{quiz.description}</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {question.text}
        </h2>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                answers[currentQuestion] === index
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-300 hover:border-indigo-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full border mr-3 flex items-center justify-center ${
                    answers[currentQuestion] === index
                      ? "border-indigo-500 bg-indigo-500 text-white"
                      : "border-gray-400"
                  }`}
                >
                  {answers[currentQuestion] === index && "✓"}
                </div>
                {option}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex space-x-4">
          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
