"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  User,
  BookOpen,
  BarChart3,
  Calendar,
  Award,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  course: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
}

interface Grade {
  id: string;
  subject: string;
  assessmentType: string;
  score: number;
  maxScore: number;
  weight: number;
  date: string;
  comments?: string;
}

interface ReportData {
  student: Student;
  report: Array<{
    subject: string;
    average: number;
    gradeLetter: string;
    totalAssessments: number;
    grades: Grade[];
  }>;
  overall: {
    average: number;
    totalSubjects: number;
    totalAssessments: number;
  };
  attendance: {
    attendanceRate: number;
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  generatedAt: string;
}

export function StudentReport() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetchReport(selectedStudentId);
    }
  }, [selectedStudentId]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get("/api/students");
      setStudents(response.data);
      if (response.data.length > 0) {
        setSelectedStudentId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchReport = async (studentId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/grading/report/${studentId}`);
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!reportData) return;

    setGeneratingPDF(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;

      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(30, 30, 30);
      pdf.text("STUDENT ACADEMIC REPORT", pageWidth / 2, yPos, {
        align: "center",
      });
      yPos += 10;

      // Report Info
      pdf.setFontSize(11);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Generated on: ${new Date(reportData.generatedAt).toLocaleDateString()}`,
        20,
        yPos,
      );
      yPos += 7;

      // Student Information
      pdf.setFontSize(16);
      pdf.setTextColor(30, 30, 30);
      pdf.text("Student Information", 20, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      const studentInfo = [
        [
          `Name:`,
          `${reportData.student.firstName} ${reportData.student.lastName}`,
        ],
        [`Student ID:`, reportData.student.studentId],
        [`Course:`, reportData.student.course],
        [`Email:`, reportData.student.email],
        [`Phone:`, reportData.student.phone],
        [
          `Date of Birth:`,
          new Date(reportData.student.dob).toLocaleDateString(),
        ],
      ];

      studentInfo.forEach(([label, value]) => {
        pdf.text(label, 25, yPos);
        pdf.text(value, 70, yPos);
        yPos += 6;
      });

      yPos += 10;

      // Overall Performance
      pdf.setFontSize(16);
      pdf.setTextColor(30, 30, 30);
      pdf.text("Overall Performance", 20, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      const overallInfo = [
        [`Overall Average:`, `${reportData.overall.average.toFixed(1)}%`],
        [`Subjects Taken:`, reportData.overall.totalSubjects.toString()],
        [`Total Assessments:`, reportData.overall.totalAssessments.toString()],
        [
          `Attendance Rate:`,
          `${reportData.attendance.attendanceRate.toFixed(1)}%`,
        ],
      ];

      overallInfo.forEach(([label, value]) => {
        pdf.text(label, 25, yPos);
        pdf.text(value, 70, yPos);
        yPos += 6;
      });

      yPos += 10;

      // Attendance Summary
      pdf.setFontSize(16);
      pdf.text("Attendance Summary", 20, yPos);
      yPos += 10;

      const attendanceData = [
        [`Present`, reportData.attendance.present],
        [`Absent`, reportData.attendance.absent],
        [`Late`, reportData.attendance.late],
        [`Excused`, reportData.attendance.excused],
        [`Total`, reportData.attendance.total],
      ];

      (pdf as any).autoTable({
        startY: yPos,
        head: [["Status", "Count"]],
        body: attendanceData,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 },
      });

      yPos = (pdf as any).lastAutoTable.finalY + 15;

      // Subject-wise Grades
      pdf.setFontSize(16);
      pdf.text("Subject-wise Grades", 20, yPos);
      yPos += 10;

      const subjectData = reportData.report.map((subject) => [
        subject.subject,
        `${subject.average.toFixed(1)}%`,
        subject.gradeLetter,
        subject.totalAssessments.toString(),
      ]);

      (pdf as any).autoTable({
        startY: yPos,
        head: [["Subject", "Average", "Grade", "Assessments"]],
        body: subjectData,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40 },
          2: { cellWidth: 25 },
          3: { cellWidth: 45 },
        },
      });

      yPos = (pdf as any).lastAutoTable.finalY + 15;

      // Detailed Grades for each subject
      reportData.report.forEach((subject, index) => {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setFontSize(14);
        pdf.text(`${subject.subject} - Detailed Grades`, 20, yPos);
        yPos += 10;

        const gradeDetails = subject.grades.map((grade) => [
          new Date(grade.date).toLocaleDateString(),
          grade.assessmentType,
          `${grade.score}/${grade.maxScore}`,
          `${((grade.score / grade.maxScore) * 100).toFixed(1)}%`,
          grade.weight.toString(),
        ]);

        (pdf as any).autoTable({
          startY: yPos,
          head: [["Date", "Type", "Score", "Percentage", "Weight"]],
          body: gradeDetails,
          theme: "grid",
          headStyles: { fillColor: [16, 185, 129] },
          styles: { fontSize: 9 },
          margin: { left: 20, right: 20 },
        });

        yPos = (pdf as any).lastAutoTable.finalY + 15;
      });

      // Add page numbers
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - 30,
          pdf.internal.pageSize.getHeight() - 10,
        );
      }

      // Save the PDF
      pdf.save(`Student_Report_${reportData.student.studentId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-800";
    if (percentage >= 80) return "bg-blue-100 text-blue-800";
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800";
    if (percentage >= 60) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Student Academic Report</CardTitle>
              <CardDescription>
                Generate detailed reports for individual students
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} (
                      {student.studentId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={generatePDF}
                disabled={!reportData || generatingPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {generatingPDF ? "Generating..." : "Download PDF"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {reportData && (
        <>
          {/* Student Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {reportData.student.firstName} {reportData.student.lastName}
                  </CardTitle>
                  <CardDescription className="space-y-1 mt-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Student ID: {reportData.student.studentId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Course: {reportData.student.course}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Report Generated:{" "}
                        {new Date(reportData.generatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardDescription>
                </div>
                <Badge className="text-lg px-4 py-2">
                  Overall: {reportData.overall.average.toFixed(1)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Overall Average</div>
                  <div className="text-3xl font-bold">
                    {reportData.overall.average.toFixed(1)}%
                  </div>
                  <Progress
                    value={reportData.overall.average}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Attendance Rate</div>
                  <div className="text-3xl font-bold">
                    {reportData.attendance.attendanceRate.toFixed(1)}%
                  </div>
                  <Progress
                    value={reportData.attendance.attendanceRate}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Subjects</div>
                  <div className="text-3xl font-bold">
                    {reportData.overall.totalSubjects}
                  </div>
                  <div className="text-sm text-gray-500">
                    Total subjects taken
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Assessments</div>
                  <div className="text-3xl font-bold">
                    {reportData.overall.totalAssessments}
                  </div>
                  <div className="text-sm text-gray-500">
                    Total graded assessments
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject-wise Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reportData.report.map((subject) => (
                  <div key={subject.subject} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {subject.subject}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {subject.totalAssessments} assessment
                          {subject.totalAssessments !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          className={`text-lg px-4 py-2 ${getGradeColor(subject.average)}`}
                        >
                          {subject.average.toFixed(1)}%
                        </Badge>
                        <Badge variant="outline" className="text-lg px-4 py-2">
                          {getGradeLetter(subject.average)}
                        </Badge>
                      </div>
                    </div>

                    <Progress value={subject.average} className="h-2 mb-4" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Recent Assessments
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>%</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subject.grades.slice(0, 3).map((grade) => (
                              <TableRow key={grade.id}>
                                <TableCell className="text-sm">
                                  {new Date(grade.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {grade.assessmentType}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {grade.score}/{grade.maxScore}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={getGradeColor(
                                      (grade.score / grade.maxScore) * 100,
                                    )}
                                  >
                                    {(
                                      (grade.score / grade.maxScore) *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Performance Analysis
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Highest Score:</span>
                            <span className="font-semibold">
                              {Math.max(
                                ...subject.grades.map(
                                  (g) => (g.score / g.maxScore) * 100,
                                ),
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Lowest Score:</span>
                            <span className="font-semibold">
                              {Math.min(
                                ...subject.grades.map(
                                  (g) => (g.score / g.maxScore) * 100,
                                ),
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Average Score:</span>
                            <span className="font-semibold">
                              {subject.average.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Trend:</span>
                            <span className="font-semibold flex items-center gap-1">
                              {subject.average >= 70 ? (
                                <>
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                  <span className="text-green-600">
                                    Improving
                                  </span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-4 w-4 text-red-600" />
                                  <span className="text-red-600">
                                    Needs Attention
                                  </span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Details */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {reportData.attendance.present}
                  </div>
                  <div className="text-sm text-green-600">Present</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-700">
                    {reportData.attendance.absent}
                  </div>
                  <div className="text-sm text-red-600">Absent</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-700">
                    {reportData.attendance.late}
                  </div>
                  <div className="text-sm text-yellow-600">Late</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {reportData.attendance.excused}
                  </div>
                  <div className="text-sm text-blue-600">Excused</div>
                </div>
              </div>

              <div className="text-center">
                <div className="inline-block bg-gray-50 px-6 py-3 rounded-lg">
                  <div className="text-sm text-gray-500">
                    Overall Attendance Rate
                  </div>
                  <div className="text-3xl font-bold text-gray-800">
                    {reportData.attendance.attendanceRate.toFixed(1)}%
                  </div>
                  <Progress
                    value={reportData.attendance.attendanceRate}
                    className="h-2 mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recommendations & Action Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.report.map((subject) => {
                  const needsImprovement = subject.average < 70;
                  const excellent = subject.average >= 90;

                  return (
                    <div
                      key={subject.subject}
                      className="flex items-start gap-3"
                    >
                      <div
                        className={`mt-1 h-3 w-3 rounded-full ${
                          excellent
                            ? "bg-green-500"
                            : needsImprovement
                              ? "bg-red-500"
                              : "bg-yellow-500"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium">{subject.subject}</h4>
                        <p className="text-sm text-gray-600">
                          {excellent
                            ? "Excellent performance! Consider advanced topics or mentoring peers."
                            : needsImprovement
                              ? "Needs improvement. Recommend additional practice and tutoring sessions."
                              : "Good progress. Focus on consistent practice to reach higher grades."}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Overall Recommendations:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Schedule regular progress reviews every month</li>
                    <li>• Attend all scheduled tutoring sessions</li>
                    <li>• Complete all assignments on time</li>
                    <li>• Participate actively in class discussions</li>
                    <li>
                      • Seek help immediately when struggling with concepts
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
