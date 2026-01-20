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

interface Attendance {
  id?: string;
  studentId: string;
  date: string;
  status: "Present" | "Absent" | "Late" | "Excused";
  subject: string;
  remarks?: string;
}

interface AttendanceFormProps {
  attendance?: Attendance | null;
  students: Student[];
  onSave: (attendanceData: any) => void;
  onCancel: () => void;
}

export function AttendanceForm({
  attendance,
  students,
  onSave,
  onCancel,
}: AttendanceFormProps) {
  const [formData, setFormData] = useState<Partial<Attendance>>({
    studentId: "",
    date: new Date().toISOString(),
    status: "Present",
    subject: "",
    remarks: "",
  });

  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    if (attendance) {
      setFormData(attendance);
      setDate(new Date(attendance.date));
    }
  }, [attendance]);

  const handleChange = (field: keyof Attendance, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentId || !formData.subject) {
      alert("Please fill in all required fields");
      return;
    }

    const attendanceData = {
      ...formData,
      id: attendance?.id,
      date: date.toISOString(),
    };

    onSave(attendanceData);
  };

  const statusOptions = [
    { value: "Present", label: "Present", color: "text-green-600" },
    { value: "Absent", label: "Absent", color: "text-red-600" },
    { value: "Late", label: "Late", color: "text-yellow-600" },
    { value: "Excused", label: "Excused", color: "text-blue-600" },
  ];

  const subjects = [
    "Pro-6-Month Professional Course",
    "Module 1 - Beginners",
    "Module 2A - Fullstack Web Developement",
    "Module 2B - Software Developement",
    "Module 3 - Networking & CyberSecurity",
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

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value: "Present" | "Absent" | "Late" | "Excused") =>
              handleChange("status", value)
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${option.color.replace("text", "bg")}`}
                    />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          value={formData.remarks}
          onChange={(e) => handleChange("remarks", e.target.value)}
          placeholder="Add any remarks about this attendance..."
          rows={3}
        />
        <p className="text-sm text-gray-500">
          For example: "Came late by 10 minutes" or "Had doctor's appointment"
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {attendance ? "Update Record" : "Save Record"}
        </Button>
      </div>
    </form>
  );
}
