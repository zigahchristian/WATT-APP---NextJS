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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import axios from "axios";

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  course: string;
}

interface BulkAttendanceProps {
  students: Student[];
  onSave: () => void;
  onCancel: () => void;
}

export function BulkAttendance({
  students,
  onSave,
  onCancel,
}: BulkAttendanceProps) {
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [subject, setSubject] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, string>
  >({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
    "Python Programing Language",
    "C Programing Language",
    "Mavis Beacon Teaches Typing",
    "Networking",
    "Cybersecurity",
    "Windows OS Fundamentals",
    "Introduction to AI",
    "Accessing the Internet",
  ];
  const statusOptions = [
    {
      value: "Present",
      label: "Present",
      color: "bg-green-100 text-green-800",
    },
    { value: "Absent", label: "Absent", color: "bg-red-100 text-red-800" },
    { value: "Late", label: "Late", color: "bg-yellow-100 text-yellow-800" },
    { value: "Excused", label: "Excused", color: "bg-blue-100 text-blue-800" },
  ];

  // Initialize all students as "Present" by default
  useEffect(() => {
    const defaultRecords: Record<string, string> = {};
    const defaultRemarks: Record<string, string> = {};

    students.forEach((student) => {
      defaultRecords[student.id] = "Present";
      defaultRemarks[student.id] = "";
    });

    setAttendanceRecords(defaultRecords);
    setRemarks(defaultRemarks);
  }, [students]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleRemarksChange = (studentId: string, remark: string) => {
    setRemarks((prev) => ({
      ...prev,
      [studentId]: remark,
    }));
  };

  const handleSelectAll = (status: string) => {
    const updatedRecords: Record<string, string> = {};
    Object.keys(attendanceRecords).forEach((studentId) => {
      updatedRecords[studentId] = status;
    });
    setAttendanceRecords(updatedRecords);
  };

  const handleSubmit = async () => {
    if (!date || !subject) {
      alert("Please select a date and subject");
      return;
    }

    const records = Object.entries(attendanceRecords)
      .filter(([studentId]) => students.some((s) => s.id === studentId))
      .map(([studentId, status]) => ({
        studentId,
        status,
        remarks: remarks[studentId] || "",
      }));

    if (records.length === 0) {
      alert("No students selected");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/attendance/bulk", {
        date,
        subject,
        records,
      });

      alert(`Attendance recorded for ${response.data.processed} students`);
      onSave();
    } catch (error) {
      console.error("Error saving bulk attendance:", error);
      alert("Failed to save attendance records");
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Select value={subject} onValueChange={setSubject} required>
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

        <div className="space-y-2">
          <Label htmlFor="search">Search Students</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium">Set all to:</span>
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSelectAll(option.value)}
            className="gap-1"
          >
            <Badge className={option.color}>{option.label}</Badge>
          </Button>
        ))}
      </div>

      {/* Students Table */}
      <div className="border rounded-lg">
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white">
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-sm">
                    {student.studentId}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {student.firstName} {student.lastName}
                    </div>
                  </TableCell>
                  <TableCell>{student.course}</TableCell>
                  <TableCell>
                    <Select
                      value={attendanceRecords[student.id] || "Present"}
                      onValueChange={(value) =>
                        handleStatusChange(student.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="Optional remarks"
                      value={remarks[student.id] || ""}
                      onChange={(e) =>
                        handleRemarksChange(student.id, e.target.value)
                      }
                      className="w-full"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
        {statusOptions.map((option) => {
          const count = Object.values(attendanceRecords).filter(
            (status) => status === option.value,
          ).length;
          return (
            <div key={option.value} className="text-center">
              <div
                className={`text-lg font-bold ${option.color.split(" ")[1]}`}
              >
                {count}
              </div>
              <div className="text-sm text-gray-600">{option.label}</div>
            </div>
          );
        })}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-500">
          Total students: {filteredStudents.length}
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !date || !subject}
          >
            {loading ? "Saving..." : `Save ${filteredStudents.length} Records`}
          </Button>
        </div>
      </div>
    </div>
  );
}
