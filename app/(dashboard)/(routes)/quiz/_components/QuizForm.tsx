// src/app/_components/QuizForm.tsx
"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface ImportedQuestion {
  text: string;
  options: string[];
  correctAnswer: number;
  points?: number;
}

export default function QuizForm({
  onQuizCreated,
}: {
  onQuizCreated: (code: string) => void;
}) {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(300);
  const [questions, setQuestions] = useState<Question[]>([
    { text: "", options: ["", "", "", ""], correctAnswer: 0, points: 1 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [importMode, setImportMode] = useState<"manual" | "json">("manual");
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [showJsonExample, setShowJsonExample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: ["", "", "", ""], correctAnswer: 0, points: 1 },
    ]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    if (field === "options") {
      newQuestions[index].options = [...value];
    } else {
      (newQuestions[index] as any)[field] = value;
    }
    setQuestions(newQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        parseImportedData(importedData);
        setJsonInput(content);
      } catch (err) {
        setJsonError("Invalid JSON file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  const parseImportedData = (data: any) => {
    setJsonError("");

    // Handle array of questions
    if (Array.isArray(data)) {
      if (data.length === 0) {
        setJsonError("JSON array is empty");
        return;
      }

      const parsedQuestions: Question[] = data.map(
        (item: any, index: number) => {
          // Validate required fields
          if (
            !item.text ||
            !Array.isArray(item.options) ||
            item.options.length === 0
          ) {
            throw new Error(
              `Question ${index + 1} missing required fields (text, options)`,
            );
          }

          if (
            typeof item.correctAnswer !== "number" ||
            item.correctAnswer < 0 ||
            item.correctAnswer >= item.options.length
          ) {
            throw new Error(`Question ${index + 1} has invalid correctAnswer`);
          }

          return {
            text: item.text,
            options: item.options,
            correctAnswer: item.correctAnswer,
            points: item.points || 1,
          };
        },
      );

      setQuestions(parsedQuestions);
      setImportMode("json");
      setJsonInput(JSON.stringify(data, null, 2));
    }
    // Handle object with questions array
    else if (data.questions && Array.isArray(data.questions)) {
      // Also try to set title and description from object if provided
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.timeLimit) setTimeLimit(data.timeLimit);

      parseImportedData(data.questions);
    } else {
      setJsonError(
        'JSON must contain an array of questions or an object with a "questions" array',
      );
    }
  };

  const handleJsonInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    setJsonError("");
  };

  const importFromJson = () => {
    try {
      if (!jsonInput.trim()) {
        setJsonError("Please enter JSON data");
        return;
      }

      const parsedData = JSON.parse(jsonInput);
      parseImportedData(parsedData);
    } catch (err: any) {
      setJsonError(`Invalid JSON: ${err.message}`);
    }
  };

  const validateJsonFormat = () => {
    if (!jsonInput.trim()) return true;

    try {
      const parsed = JSON.parse(jsonInput);

      // Check if it's an array or object with questions array
      const isValid =
        Array.isArray(parsed) ||
        (typeof parsed === "object" &&
          parsed !== null &&
          Array.isArray(parsed.questions));

      return isValid;
    } catch {
      return false;
    }
  };

  const downloadTemplate = () => {
    const template = {
      title: "Sample Quiz",
      description: "This is a sample quiz description",
      timeLimit: 300,
      questions: [
        {
          text: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correctAnswer: 2, // Zero-based index: Paris is index 2
          points: 1,
        },
        {
          text: "Which planet is known as the Red Planet?",
          options: ["Earth", "Mars", "Jupiter", "Venus"],
          correctAnswer: 1, // Mars is index 1
          points: 2,
        },
      ],
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz-template.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearQuestions = () => {
    setQuestions([
      { text: "", options: ["", "", "", ""], correctAnswer: 0, points: 1 },
    ]);
    setJsonInput("");
    setJsonError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) {
      setError("You must be logged in to create a quiz");
      return;
    }

    // Validate form
    if (!title.trim()) {
      setError("Quiz title is required");
      return;
    }

    if (questions.length === 0) {
      setError("At least one question is required");
      return;
    }

    const validationErrors: string[] = [];

    questions.forEach((q, index) => {
      if (!q.text.trim()) {
        validationErrors.push(`Question ${index + 1} text is required`);
      }

      const emptyOptions = q.options.filter((opt) => !opt.trim());
      if (emptyOptions.length > 0) {
        validationErrors.push(`Question ${index + 1} has empty options`);
      }

      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        validationErrors.push(
          `Question ${index + 1} has invalid correct answer`,
        );
      }
    });

    if (validationErrors.length > 0) {
      setError(
        `Please fix the following errors:\n${validationErrors.join("\n")}`,
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          timeLimit,
          questions,
          createdByEmail: session.user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create quiz");
      }

      onQuizCreated(data.code);
    } catch (error: any) {
      setError(error.message || "Failed to create quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-2xl p-8"
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 whitespace-pre-line">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Quiz Info */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter quiz description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit: {Math.floor(timeLimit / 60)}:
              {(timeLimit % 60).toString().padStart(2, "0")}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="60"
                max="1800"
                step="30"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1 min</span>
                <span>5 mins</span>
                <span>10 mins</span>
                <span>20 mins</span>
                <span>30 mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Import Mode Selector */}
        <div className="border-t pt-8">
          <div className="flex flex-col space-y-4 mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Questions</h3>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setImportMode("manual")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  importMode === "manual"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Manual Entry
              </button>
              <button
                type="button"
                onClick={() => setImportMode("json")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  importMode === "json"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Import JSON
              </button>
            </div>
          </div>

          {importMode === "manual" ? (
            <>
              {/* Manual Question Entry */}
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">
                          {index + 1}
                        </div>
                        <h4 className="font-semibold text-gray-700">
                          Question {index + 1}
                        </h4>
                      </div>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="text-red-600 hover:text-red-800 flex items-center"
                        >
                          <svg
                            className="w-5 h-5 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Text <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) =>
                            updateQuestion(index, "text", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Enter your question"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Options <span className="text-red-500">*</span>
                          <span className="text-sm text-gray-500 ml-2">
                            Click the radio button to mark the correct answer
                          </span>
                        </label>
                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex items-center space-x-3"
                            >
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                checked={question.correctAnswer === optionIndex}
                                onChange={() =>
                                  updateQuestion(
                                    index,
                                    "correctAnswer",
                                    optionIndex,
                                  )
                                }
                                className="text-green-600 focus:ring-green-500 h-4 w-4"
                              />
                              <div className="flex-1 flex items-center">
                                <span className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">
                                  {String.fromCharCode(65 + optionIndex)}
                                </span>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) =>
                                    updateOption(
                                      index,
                                      optionIndex,
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder={`Option ${optionIndex + 1}`}
                                  required
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Points
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={question.points}
                          onChange={(e) =>
                            updateQuestion(
                              index,
                              "points",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Points awarded for correct answer
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Question
                  </button>

                  <div className="text-sm text-gray-600">
                    {questions.length} question
                    {questions.length !== 1 ? "s" : ""} • Total points:{" "}
                    {questions.reduce((sum, q) => sum + q.points, 0)}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* JSON Import Section */}
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-bold text-blue-800 mb-2">
                    Import Questions from JSON
                  </h4>
                  <p className="text-blue-700 mb-4">
                    Upload a JSON file or paste JSON data to import questions.
                    You can also download a template to get started.
                  </p>

                  <div className="flex flex-wrap gap-4 mb-4">
                    <button
                      type="button"
                      onClick={downloadTemplate}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition flex items-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download Template
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowJsonExample(!showJsonExample)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {showJsonExample ? "Hide Example" : "Show Example"}
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition flex items-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Upload JSON File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {showJsonExample && (
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
                      <pre className="text-sm">
                        {`{
  "title": "Geography Quiz",
  "description": "Test your geography knowledge",
  "timeLimit": 600,
  "questions": [
    {
      "text": "What is the capital of France?",
      "options": ["London", "Berlin", "Paris", "Madrid"],
      "correctAnswer": 2,
      "points": 1
    },
    {
      "text": "Which planet is known as the Red Planet?",
      "options": ["Earth", "Mars", "Jupiter", "Venus"],
      "correctAnswer": 1,
      "points": 2
    }
  ]
}`}
                      </pre>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      JSON Data
                    </label>
                    <textarea
                      value={jsonInput}
                      onChange={handleJsonInputChange}
                      className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="Paste your JSON data here..."
                    />
                    {jsonError && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {jsonError}
                      </div>
                    )}
                    {jsonInput && !jsonError && validateJsonFormat() && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                        ✅ Valid JSON format detected. {questions.length}{" "}
                        question{questions.length !== 1 ? "s" : ""} loaded.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-4">
                    <button
                      type="button"
                      onClick={importFromJson}
                      disabled={!jsonInput.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4"
                        />
                      </svg>
                      Import Questions
                    </button>

                    <button
                      type="button"
                      onClick={clearQuestions}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Preview of imported questions */}
                {questions.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-gray-700">
                        Preview ({questions.length} questions)
                      </h4>
                      <div className="text-sm text-gray-600">
                        Total points:{" "}
                        {questions.reduce((sum, q) => sum + q.points, 0)}
                      </div>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                      {questions.map((question, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center mb-3">
                            <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                              {index + 1}
                            </div>
                            <div className="font-medium text-gray-700">
                              {question.text}
                            </div>
                          </div>

                          <div className="ml-8 space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`flex items-center text-sm ${
                                  optIndex === question.correctAnswer
                                    ? "text-green-600 font-medium"
                                    : "text-gray-600"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${
                                    optIndex === question.correctAnswer
                                      ? "border-green-500 bg-green-500 text-white"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {optIndex === question.correctAnswer && "✓"}
                                </div>
                                <span>
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="ml-8 mt-2 text-xs text-gray-500">
                            Points: {question.points}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Submit Button */}
        <div className="border-t pt-6">
          <button
            type="submit"
            disabled={isSubmitting || questions.length === 0}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Quiz...
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Create Quiz
              </>
            )}
          </button>

          <p className="text-center text-gray-500 text-sm mt-4">
            {questions.length} question{questions.length !== 1 ? "s" : ""} •
            Total points: {questions.reduce((sum, q) => sum + q.points, 0)} •
            Time limit: {Math.floor(timeLimit / 60)}:
            {(timeLimit % 60).toString().padStart(2, "0")}
          </p>
        </div>
      </div>
    </form>
  );
}
