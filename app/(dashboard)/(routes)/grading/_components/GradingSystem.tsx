"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Search,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  User,
  BookOpen,
  Filter,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import { GradingForm } from "./GradingForm";
import { StudentReport } from "./StudentReport";
import { GradeConfig } from "./GradeConfig";

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  course: string;
  email: string;
  phone?: string;
  address?: string;
  imageUrl?: string; // Base64 image from database
  enrollmentDate?: string;
  dateOfBirth?: string;
}

interface Grade {
  id: string;
  studentId: string;
  subject: string;
  assessmentType: string;
  score: number;
  maxScore: number;
  date: string;
  comments?: string;
  student: Student;
}

export function GradingSystem() {
  const [activeTab, setActiveTab] = useState("grades");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | undefined>();
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
  const [showGradingForm, setShowGradingForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch students and grades from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch grades and students in parallel
      const [gradesRes, studentsRes] = await Promise.all([
        axios.get("/api/grading"),
        axios.get("/api/students"),
      ]);

      const studentsList: Student[] = studentsRes.data;

      // Create a map for quick student lookup
      const studentsMap: Record<string, Student> = {};
      studentsList.forEach((s) => {
        studentsMap[s.id] = s;
      });

      // Process grades and attach student info including imageUrl
      const processedGrades: Grade[] = gradesRes.data.map((grade: any) => {
        const { ...rest } = grade;

        // Attach the corresponding student info
        const student = studentsMap[grade.studentId] || {
          id: grade.studentId,
          firstName: "Unknown",
          lastName: "",
          email: "",
          course: "",
          imageUrl: "",
        };

        return {
          ...rest,
          student, // attach student info with imageUrl
        };
      });

      // Update state
      setGrades(processedGrades);
      setStudents(studentsList);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrade = async (gradeData: any) => {
    try {
      // Remove weight field before sending
      const { ...dataWithoutWeight } = gradeData;

      if (editingGrade) {
        await axios.put(
          `/api/grading?id=${editingGrade.id}`,
          dataWithoutWeight,
        );
      } else {
        await axios.post("/api/grading", dataWithoutWeight);
      }
      await fetchData();
      setShowGradingForm(false);
      setEditingGrade(null);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDeleteGrade = async (id: string) => {
    if (!confirm("Are you sure you want to delete this grade?")) return;
    try {
      await axios.delete(`/api/grading?id=${id}`);
      await fetchData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const filteredGrades = grades.filter((g) => {
    const matchesSearch =
      searchTerm === "" ||
      g.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.student.studentId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStudent = !selectedStudent || g.studentId === selectedStudent;
    const matchesSubject = !selectedSubject || g.subject === selectedSubject;

    return matchesSearch && matchesStudent && matchesSubject;
  });

  const statistics = {
    totalGrades: grades.length,
    averageScore:
      grades.length > 0
        ? grades.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) /
          grades.length
        : 0,
    studentsWithGrades: new Set(grades.map((g) => g.studentId)).size,
    subjects: new Set(grades.map((g) => g.subject)).size,
  };

  const uniqueSubjects = Array.from(
    new Set(grades.map((g) => g.subject).filter(Boolean)),
  );

  const gradeColor = (pct: number) => {
    if (pct >= 90) return "bg-green-100 text-green-800";
    if (pct >= 80) return "bg-blue-100 text-blue-800";
    if (pct >= 70) return "bg-yellow-100 text-yellow-800";
    if (pct >= 60) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  // ✅ Generate PDF with student image from database
  const generateStudentReport = (student: Student, gradesList: Grade[]) => {
    const doc = new jsPDF("portrait", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Add decorative header
    doc.setFillColor(142, 35, 95);
    doc.rect(0, 0, pageWidth, 40, "F");

    // School/University Logo
    try {
      // You can add your school logo here if available
      // const schoolLogo = "data:image/png;base64,..."; // Base64 school logo
      // doc.addImage(schoolLogo, "PNG", margin, 5, 30, 30);
    } catch (err) {
      console.log("No school logo available");
    }

    // School/University Name
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("WATT PROFESSIONAL STUDIES", pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFontSize(16);
    doc.text("Monthly Student Report", pageWidth / 2, 30, {
      align: "center",
    });

    yPosition = 50;

    // Student Information Section with PROFILE IMAGE
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 50, "F");
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 50);

    // Add student profile image if available
    const imageWidth = 35;
    const imageHeight = 40;
    const imageX = pageWidth - margin - imageWidth - 5;
    const imageY = yPosition + 5;

    if (student.imageUrl) {
      try {
        // Check if the base64 string is valid
        console.log(student);
        const base64Data = student.imageUrl;

        // Handle different base64 formats
        let imageData = base64Data;
        if (base64Data.startsWith("data:image")) {
          // It already has data URL prefix
          imageData = base64Data;
        } else {
          // Assume it's raw base64, add PNG prefix
          imageData = `data:image/png;base64,${base64Data}`;
        }

        // Add the image to PDF
        doc.addImage(imageData, "PNG", imageX, imageY, imageWidth, imageHeight);

        // Add border around image
        doc.setDrawColor(150, 150, 150);
        doc.rect(imageX, imageY, imageWidth, imageHeight);
      } catch (err) {
        console.warn("Could not load student image:", err);
        // Fallback: Draw placeholder
        doc.setFillColor(240, 240, 240);
        doc.rect(imageX, imageY, imageWidth, imageHeight, "F");
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text(
          "No Photo",
          imageX + imageWidth / 2 - 10,
          imageY + imageHeight / 2,
          {
            align: "center",
          },
        );
      }
    } else {
      // No image available - draw placeholder
      doc.setFillColor(240, 240, 240);
      doc.rect(imageX, imageY, imageWidth, imageHeight, "F");
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text(
        "No Photo",
        imageX + imageWidth / 2 - 10,
        imageY + imageHeight / 2,
        {
          align: "center",
        },
      );
    }

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("STUDENT INFORMATION", margin + 5, yPosition + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Student info columns (adjusted for image space)
    const col1 = margin + 5;
    const col2 = pageWidth / 2 - 20; // Move left to make room for image

    doc.text(
      `Name: ${student.firstName} ${student.lastName}`,
      col1,
      yPosition + 18,
    );
    doc.text(`Student ID: ${student.studentId}`, col1, yPosition + 25);
    doc.text(`Course: ${student.course}`, col1, yPosition + 32);
    doc.text(`Email: ${student.email}`, col1, yPosition + 39);

    doc.text(`Phone: ${student.phone || "N/A"}`, col2, yPosition + 18);
    if (student.dateOfBirth) {
      doc.text(
        `Date of Birth: ${new Date(student.dateOfBirth).toLocaleDateString()}`,
        col2,
        yPosition + 25,
      );
    }
    if (student.enrollmentDate) {
      doc.text(
        `Enrolled: ${new Date(student.enrollmentDate).toLocaleDateString()}`,
        col2,
        yPosition + 32,
      );
    }
    doc.text(
      `Report Date: ${new Date().toLocaleDateString()}`,
      col2,
      yPosition + 39,
    );

    yPosition += 60;

    // Grades Table Section
    const studentGrades = gradesList.filter((g) => g.studentId === student.id);

    if (studentGrades.length > 0) {
      // Table Header
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(142, 35, 95);

      // Column widths (NO WEIGHT COLUMN)
      const colWidths = [70, 35, 30, 25, 27]; // Subject, Assessment, Score, %, Date
      const colPositions = [margin];
      for (let i = 1; i < colWidths.length; i++) {
        colPositions.push(colPositions[i - 1] + colWidths[i - 1]);
      }

      const headers = ["Subject", "Assessment", "Score", "%", "Date"];

      // Check page overflow
      if (yPosition > pageHeight - 40) {
        doc.addPage("portrait");
        yPosition = margin;
      }

      // Draw header background
      headers.forEach((_, i) => {
        doc.rect(colPositions[i], yPosition - 5, colWidths[i], 10, "F");
      });

      // Draw header text
      headers.forEach((header, i) => {
        const maxWidth = colWidths[i] - 6;
        const lines = doc.splitTextToSize(header, maxWidth);
        let textY = yPosition;

        if (lines.length > 1) {
          textY = yPosition - 1;
        }

        doc.text(lines[0], colPositions[i] + 3, textY, { maxWidth });
      });

      yPosition += 10;

      // Table Rows
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);

      studentGrades.forEach((grade, index) => {
        // Check for page overflow BEFORE adding row
        let neededHeight = 8;
        const subjectLines = doc.splitTextToSize(
          grade.subject,
          colWidths[0] - 6,
        );
        neededHeight = Math.max(neededHeight, subjectLines.length * 4);

        if (yPosition + neededHeight > pageHeight - margin) {
          doc.addPage("portrait");
          yPosition = margin;

          // Redraw header on new page
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(59, 130, 246);
          headers.forEach((_, i) => {
            doc.rect(colPositions[i], yPosition - 5, colWidths[i], 10, "F");
          });
          headers.forEach((header, i) => {
            const headerLines = doc.splitTextToSize(header, colWidths[i] - 6);
            let headerY = yPosition;
            if (headerLines.length > 1) {
              headerY = yPosition - 1;
            }
            doc.text(headerLines[0], colPositions[i] + 3, headerY, {
              maxWidth: colWidths[i] - 6,
            });
          });
          yPosition += 10;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
        }

        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
        } else {
          doc.setFillColor(255, 255, 255);
        }

        // Calculate actual row height based on content
        const rowHeight = Math.max(8, subjectLines.length * 4);

        // Draw row background
        headers.forEach((_, i) => {
          doc.rect(
            colPositions[i],
            yPosition - 5,
            colWidths[i],
            rowHeight,
            "F",
          );
        });

        // Calculate percentage
        const percentage = ((grade.score / grade.maxScore) * 100).toFixed(1);

        // Draw subject text with proper wrapping
        subjectLines.forEach((line: string, lineIndex: number) => {
          doc.text(line, colPositions[0] + 3, yPosition + lineIndex * 4, {
            maxWidth: colWidths[0] - 6,
          });
        });

        // Draw other columns (NO WEIGHT COLUMN)
        const otherData = [
          grade.assessmentType,
          `${grade.score}/${grade.maxScore}`,
          `${percentage}%`,
          new Date(grade.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        ];

        otherData.forEach((data, i) => {
          const cellX = colPositions[i + 1] + 3;
          const cellY = yPosition;
          const maxCellWidth = colWidths[i + 1] - 6;

          // Truncate long text with ellipsis if needed
          let displayText = data.toString();
          const textWidth = doc.getTextWidth(displayText);

          if (textWidth > maxCellWidth) {
            const charWidth = textWidth / displayText.length;
            const maxChars = Math.floor(maxCellWidth / charWidth) - 1;
            if (maxChars > 3) {
              displayText = displayText.substring(0, maxChars) + "...";
            }
          }

          doc.text(displayText, cellX, cellY, { maxWidth: maxCellWidth });
        });

        yPosition += rowHeight;
      });

      yPosition += 15;

      // Performance Summary Section
      if (yPosition > pageHeight - 80) {
        doc.addPage("portrait");
        yPosition = margin;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(142, 35, 95);
      doc.text("ACADEMIC PERFORMANCE SUMMARY", margin, yPosition);

      yPosition += 8;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);

      yPosition += 12;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      const totalScore = studentGrades.reduce((sum, g) => sum + g.score, 0);
      const totalMaxScore = studentGrades.reduce(
        (sum, g) => sum + g.maxScore,
        0,
      );
      const overallPercentage =
        totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

      // Summary in two columns
      const summaryCol1 = [
        `Total Subjects: ${new Set(studentGrades.map((g) => g.subject)).size}`,
        `Total Assessments: ${studentGrades.length}`,
        `Overall Score: ${totalScore}/${totalMaxScore}`,
        `Overall Percentage: ${overallPercentage.toFixed(1)}%`,
      ];

      const summaryCol2 = [
        `Final Grade: ${getLetterGrade(overallPercentage)}`,
        `GPA Equivalent: ${getGPA(overallPercentage).toFixed(2)}`,
        `Performance: ${getPerformanceRating(overallPercentage)}`,
        `Rank: ${getClassRank(student.id, gradesList)}`,
      ];

      // First column
      let tempY = yPosition;
      summaryCol1.forEach((item) => {
        doc.text(item, margin, tempY);
        tempY += 7;
      });

      // Second column
      tempY = yPosition;
      summaryCol2.forEach((item) => {
        doc.text(item, pageWidth / 2, tempY);
        tempY += 7;
      });

      yPosition = tempY + 10;

      // Comments Section
      const gradesWithComments = studentGrades.filter(
        (g) => g.comments && g.comments.trim() !== "",
      );
      if (gradesWithComments.length > 0) {
        if (yPosition > pageHeight - 60) {
          doc.addPage("portrait");
          yPosition = margin;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(59, 130, 246);
        doc.text("INSTRUCTOR COMMENTS", margin, yPosition);

        yPosition += 10;
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(80, 80, 80);

        gradesWithComments.slice(0, 3).forEach((grade) => {
          const comment = `${grade.subject}: ${grade.comments}`;
          const lines = doc.splitTextToSize(comment, pageWidth - 2 * margin);

          lines.forEach((line: string) => {
            if (yPosition > pageHeight - 20) {
              doc.addPage("portrait");
              yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += 4;
          });
          yPosition += 3;
        });
      }

      // Signature Area
      if (yPosition > pageHeight - 40) {
        doc.addPage("portrait");
        yPosition = margin;
      }

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "_________________________",
        pageWidth - margin - 60,
        pageHeight - 30,
      );
      doc.text(
        "Director of Training",
        pageWidth - margin - 50,
        pageHeight - 25,
      );

      doc.text("_________________________", margin, pageHeight - 30);
      doc.text("Facillitator Signature", margin + 10, pageHeight - 25);
    } else {
      // No grades available
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(150, 150, 150);
      doc.text(
        "No academic records available for this student.",
        pageWidth / 2,
        yPosition,
        { align: "center" },
      );
    }

    // Page Footer
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${doc.getNumberOfPages()} of ${doc.getNumberOfPages()} | Generated: ${new Date().toLocaleString()} | Student ID: ${student.studentId}`,
      pageWidth / 2,
      footerY,
      { align: "center" },
    );

    // Page Border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);

    // Save PDF
    doc.save(`${student.studentId}_${student.lastName}_Academic_Report.pdf`);
  };

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 97) return "A+";
    if (percentage >= 93) return "A";
    if (percentage >= 90) return "A-";
    if (percentage >= 87) return "B+";
    if (percentage >= 83) return "B";
    if (percentage >= 80) return "B-";
    if (percentage >= 77) return "C+";
    if (percentage >= 73) return "C";
    if (percentage >= 70) return "C-";
    if (percentage >= 67) return "D+";
    if (percentage >= 63) return "D";
    if (percentage >= 60) return "D-";
    return "F";
  };

  const getGPA = (percentage: number): number => {
    if (percentage >= 93) return 4.0;
    if (percentage >= 90) return 3.7;
    if (percentage >= 87) return 3.3;
    if (percentage >= 83) return 3.0;
    if (percentage >= 80) return 2.7;
    if (percentage >= 77) return 2.3;
    if (percentage >= 73) return 2.0;
    if (percentage >= 70) return 1.7;
    if (percentage >= 67) return 1.3;
    if (percentage >= 65) return 1.0;
    return 0.0;
  };

  const getPerformanceRating = (percentage: number): string => {
    if (percentage >= 90) return "Excellent";
    if (percentage >= 80) return "Very Good";
    if (percentage >= 70) return "Good";
    if (percentage >= 60) return "Satisfactory";
    if (percentage >= 50) return "Needs Improvement";
    return "Unsatisfactory";
  };

  const getClassRank = (studentId: string, allGrades: Grade[]): string => {
    // Calculate average percentages for all students
    const studentAverages: { [key: string]: number } = {};

    // Group grades by student
    allGrades.forEach((grade) => {
      if (!studentAverages[grade.studentId]) {
        const studentGrades = allGrades.filter(
          (g) => g.studentId === grade.studentId,
        );
        const totalPercentage = studentGrades.reduce((sum, g) => {
          return sum + (g.score / g.maxScore) * 100;
        }, 0);
        studentAverages[grade.studentId] =
          totalPercentage / studentGrades.length;
      }
    });

    // Convert to array and sort
    const sortedAverages = Object.entries(studentAverages).sort(
      ([, a], [, b]) => b - a,
    );

    // Find student's rank
    const studentIndex = sortedAverages.findIndex(([id]) => id === studentId);

    if (studentIndex === -1) return "N/A";

    const totalStudents = sortedAverages.length;
    const rank = studentIndex + 1;
    const percentile = Math.round((rank / totalStudents) * 100);

    if (rank === 1) return "1st (Top of Class)";
    if (rank === 2) return `${rank}nd (Top 10%)`;
    if (rank === 3) return `${rank}rd (Top 10%)`;
    if (percentile <= 25) return `${rank} (Top 25%)`;
    if (percentile <= 50) return `${rank} (Above Average)`;
    if (percentile <= 75) return `${rank} (Average)`;
    return `${rank} (Below Average)`;
  };

  // Truncate long subject names for table display
  const truncateSubject = (subject: string, maxLength: number = 30): string => {
    if (subject.length <= maxLength) return subject;
    return subject.substring(0, maxLength - 3) + "...";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-muted-foreground">Loading grading data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Academic Grading System
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage student grades, generate reports, and track academic
            performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={() => setShowGradingForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Grade
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-4">
              <Label htmlFor="search" className="text-sm font-medium">
                Search Records
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by student name, ID, subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-filter" className="text-sm font-medium">
                  Filter by Student
                </Label>
                <Select
                  value={selectedStudent}
                  onValueChange={setSelectedStudent}
                >
                  <SelectTrigger
                    id="student-filter"
                    className="w-full md:w-[200px]"
                  >
                    <SelectValue placeholder="All Students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex items-center gap-2">
                          {student.imageUrl ? (
                            <img
                              src={
                                student.imageUrl.startsWith("data:")
                                  ? student.imageUrl
                                  : `data:image/png;base64,${student.imageUrl}`
                              }
                              alt={`${student.firstName} ${student.lastName}`}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-3 w-3 text-gray-500" />
                            </div>
                          )}
                          <span>
                            {student.firstName} {student.lastName} (
                            {student.studentId})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject-filter" className="text-sm font-medium">
                  Filter by Subject
                </Label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger
                    id="subject-filter"
                    className="w-full md:w-[200px]"
                  >
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {uniqueSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {truncateSubject(subject, 40)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(selectedStudent || selectedSubject || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStudent(undefined);
                  setSelectedSubject(undefined);
                  setSearchTerm("");
                }}
                className="h-10"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Grades
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalGrades}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all students and subjects
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Score
            </CardTitle>
            <BookOpen className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.averageScore.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall class performance
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Students
            </CardTitle>
            <User className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.studentsWithGrades}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              With grade records
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Subjects
            </CardTitle>
            <BookOpen className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.subjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique subjects assessed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="grades" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Grades
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        {/* Grades Tab */}
        <TabsContent value="grades" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Grade Records</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredGrades.length} of {grades.length} records
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold w-[200px]">
                          Student
                        </TableHead>
                        <TableHead className="pl-8 font-semibold w-[250px]">
                          Subject
                        </TableHead>
                        <TableHead className="font-semibold">
                          Assessment
                        </TableHead>
                        <TableHead className="font-semibold">Score</TableHead>
                        <TableHead className="font-semibold">
                          Percentage
                        </TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGrades.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <div className="flex flex-col items-center justify-center text-gray-400">
                              <BookOpen className="h-12 w-12 mb-4" />
                              <p className="text-lg font-medium mb-2">
                                No grades found
                              </p>
                              <p className="text-sm">
                                {searchTerm ||
                                selectedStudent ||
                                selectedSubject
                                  ? "Try adjusting your filters"
                                  : "Add your first grade to get started"}
                              </p>
                              {!searchTerm &&
                                !selectedStudent &&
                                !selectedSubject && (
                                  <Button
                                    onClick={() => setShowGradingForm(true)}
                                    className="mt-4"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Grade
                                  </Button>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredGrades.map((grade) => {
                          const percentage =
                            (grade.score / grade.maxScore) * 100;
                          const isExpanded = expandedRows.has(grade.id);
                          const fullSubject = grade.subject;
                          const displaySubject = isExpanded
                            ? fullSubject
                            : truncateSubject(fullSubject, 40);

                          return (
                            <>
                              <TableRow
                                key={grade.id}
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-3">
                                    {students.map((student) =>
                                      student.id === grade.student.id ? (
                                        student.imageUrl ? (
                                          <img
                                            key={student.id}
                                            src={
                                              student.imageUrl.startsWith(
                                                "data:",
                                              )
                                                ? student.imageUrl
                                                : `data:image/png;base64,${student.imageUrl}`
                                            }
                                            alt={`${student.firstName} ${student.lastName}`}
                                            className="w-8 h-8 rounded-full object-cover border"
                                          />
                                        ) : (
                                          <div
                                            key={student.id}
                                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                                          >
                                            <User className="h-4 w-4 text-gray-500" />
                                          </div>
                                        )
                                      ) : null,
                                    )}

                                    <div>
                                      <div className="font-semibold">
                                        {grade.student.firstName}{" "}
                                        {grade.student.lastName}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        ID: {grade.student.studentId}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>

                                <TableCell>
                                  <div className="ml-6">
                                    <Badge
                                      variant="outline"
                                      className="font-normal whitespace-nowrap"
                                    >
                                      {grade.assessmentType}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-mono whitespace-nowrap">
                                    {grade.score}
                                    <span className="text-gray-400">
                                      /{grade.maxScore}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={`${gradeColor(percentage)} font-medium whitespace-nowrap`}
                                  >
                                    {percentage.toFixed(1)}%
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm whitespace-nowrap">
                                    {new Date(grade.date).toLocaleDateString()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingGrade(grade);
                                        setShowGradingForm(true);
                                      }}
                                      title="Edit grade"
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handleDeleteGrade(grade.id)
                                      }
                                      title="Delete grade"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        generateStudentReport(
                                          grade.student,
                                          grades,
                                        )
                                      }
                                      title="Generate PDF report"
                                      className="h-8 gap-1 px-3"
                                    >
                                      <Download className="h-3 w-3" />
                                      PDF
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>

                              {/* Expanded row for comments */}
                              {isExpanded && grade.comments && (
                                <TableRow className="bg-gray-50">
                                  <TableCell colSpan={7} className="p-4">
                                    <div className="pl-8">
                                      <div className="text-sm font-medium text-gray-700 mb-1">
                                        Instructor Comments:
                                      </div>
                                      <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                                        {grade.comments}
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <StudentReport />
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config">
          <GradeConfig />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Grade Modal */}
      {showGradingForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingGrade ? "Edit Grade Record" : "Add New Grade"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowGradingForm(false);
                  setEditingGrade(null);
                }}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <GradingForm
                grade={editingGrade}
                students={students}
                onSave={handleSaveGrade}
                onCancel={() => {
                  setShowGradingForm(false);
                  setEditingGrade(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
