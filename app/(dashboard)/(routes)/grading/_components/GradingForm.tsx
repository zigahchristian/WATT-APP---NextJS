"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
}

interface Grade {
  id?: string;
  studentId: string;
  subject: string;
  assessmentType: string;
  score: number;
  maxScore: number;
  weight?: number;
  date: string;
  comments?: string;
}

interface GradingFormProps {
  grade?: Grade | null;
  students: Student[];
  onSave: (gradeData: any) => void;
  onCancel: () => void;
}

export function GradingForm({
  grade,
  students,
  onSave,
  onCancel,
}: GradingFormProps) {
  const [formData, setFormData] = useState<Partial<Grade>>({
    studentId: "",
    subject: "",
    assessmentType: "Assignment",
    score: 0,
    maxScore: 100,
    weight: 1.0,
    date: new Date().toISOString(),
    comments: "",
  });

  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    if (grade) {
      setFormData(grade);
      setDate(new Date(grade.date));
    }
  }, [grade]);

  const handleChange = (field: keyof Grade, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const gradeData = {
      ...formData,
      id: grade?.id,
      date: date.toISOString(),
      score: Number(formData.score),
      maxScore: Number(formData.maxScore),
      weight: Number(formData.weight),
    };

    onSave(gradeData);
  };

  const percentage =
    formData.score && formData.maxScore
      ? (Number(formData.score) / Number(formData.maxScore)) * 100
      : 0;

  const assessmentTypes = [
    "Assignment",
    "Quiz",
    "Exam",
    "Project",
    "Presentation",
    "Lab",
    "Participation",
  ];
  const subjects = [
    "VMware & Windows OS",
    "VMware & Linux OS",
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "Web Design",
    "Web Development",
    "Full Stack Web Developement",
    "Artificial Intelligence",
    "Python Programing Language",
    "C Programing Language",
    "Mavis Beacon Teaches Typing",
    "Networking",
    "Cybersecurity",
    "Windows OS Fundamentals",
    "Introduction to AI",
    "Accessing the Internet",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Selection */}
        <div className="space-y-2">
          <Label htmlFor="student">Student *</Label>
          <Select
            value={formData.studentId}
            onValueChange={(value) => handleChange("studentId", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} ({student.studentId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Select
            value={formData.subject}
            onValueChange={(value) => handleChange("subject", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assessment Type */}
        <div className="space-y-2">
          <Label htmlFor="assessmentType">Assessment Type *</Label>
          <Select
            value={formData.assessmentType}
            onValueChange={(value) => handleChange("assessmentType", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {assessmentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label>Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Score */}
        <div className="space-y-2">
          <Label htmlFor="score">Score *</Label>
          <Input
            id="score"
            type="number"
            min="0"
            step="0.1"
            value={formData.score}
            onChange={(e) => handleChange("score", e.target.value)}
            required
          />
        </div>

        {/* Max Score */}
        <div className="space-y-2">
          <Label htmlFor="maxScore">Maximum Score *</Label>
          <Input
            id="maxScore"
            type="number"
            min="0"
            step="1"
            value={formData.maxScore}
            onChange={(e) => handleChange("maxScore", e.target.value)}
            required
          />
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <Label htmlFor="weight">Weight *</Label>
          <Input
            id="weight"
            type="number"
            min="0.1"
            step="0.1"
            value={formData.weight}
            onChange={(e) => handleChange("weight", e.target.value)}
            required
          />
          <p className="text-sm text-gray-500">
            How much this assessment contributes to the final grade (e.g., 0.2
            for 20%)
          </p>
        </div>

        {/* Percentage Display */}
        <div className="space-y-2">
          <Label>Percentage</Label>
          <div className="p-2 bg-gray-50 rounded-md text-center">
            <div
              className={`text-2xl font-bold ${
                percentage >= 90
                  ? "text-green-600"
                  : percentage >= 80
                    ? "text-blue-600"
                    : percentage >= 70
                      ? "text-yellow-600"
                      : percentage >= 60
                        ? "text-orange-600"
                        : "text-red-600"
              }`}
            >
              {percentage.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-500">
              {percentage >= 90
                ? "Excellent"
                : percentage >= 80
                  ? "Good"
                  : percentage >= 70
                    ? "Average"
                    : percentage >= 60
                      ? "Passing"
                      : "Needs Improvement"}
            </p>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-2">
        <Label htmlFor="comments">Comments</Label>
        <Textarea
          id="comments"
          value={formData.comments}
          onChange={(e) => handleChange("comments", e.target.value)}
          placeholder="Add any comments about this grade..."
          rows={3}
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{grade ? "Update Grade" : "Save Grade"}</Button>
      </div>
    </form>
  );
}
