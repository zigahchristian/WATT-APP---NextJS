"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Phone,
  Mail,
  BookOpen,
  Calendar,
  ShieldAlert,
  Edit,
  GraduationCap,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  MoreVertical,
  IdCard,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  X,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog as ImageDialog,
  DialogContent as ImageDialogContent,
} from "@/components/ui/dialog";
import axios from "axios";
import toast from "react-hot-toast";

// Declare jsPDF autoTable type
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Student Interface
interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dob: string;
  address: string;
  course: string;
  enrollmentdate: string;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED" | "SUSPENDED";
  imageUrl: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  createdAt: string;
  updatedAt: string;
}

// Status badges configuration
const statusConfig = {
  ACTIVE: {
    variant: "default" as const,
    label: "Active",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  INACTIVE: {
    variant: "secondary" as const,
    label: "Inactive",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: XCircle,
  },
  GRADUATED: {
    variant: "success" as const,
    label: "Graduated",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: GraduationCap,
  },
  SUSPENDED: {
    variant: "destructive" as const,
    label: "Suspended",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertTriangle,
  },
};

// Gender labels
const genderLabels = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

// Course options
const courseOptions = [
  "Pro-6-Month Professional Course",
  "Module 1 - Beginners",
  "Module 2A - Fullstack Web Developement",
  "Module 2B - Software Developement",
  "Module 3 - Networking & CyberSecurity",
];

// Helper function to safely format dates
const safeFormatDate = (
  dateString: string | Date | null | undefined,
  formatString: string = "PPP"
): string => {
  if (!dateString) return "N/A";

  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, formatString);
  } catch {
    return "N/A";
  }
};

// Calculate age from date of birth
const calculateAge = (dob: string): string => {
  if (!dob) return "N/A";

  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return `${age} years`;
};

// Calculate enrollment duration
const calculateEnrollmentDuration = (enrollmentdate: string): string => {
  if (!enrollmentdate) return "N/A";

  const startDate = new Date(enrollmentdate);
  const today = new Date();
  const months =
    (today.getFullYear() - startDate.getFullYear()) * 12 +
    today.getMonth() -
    startDate.getMonth();

  if (months < 12) {
    return `${months} month${months !== 1 ? "s" : ""}`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years} year${years !== 1 ? "s" : ""}${
      remainingMonths > 0
        ? ` ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`
        : ""
    }`;
  }
};

// Function to convert image to base64
const getImageBase64 = async (imageUrl: string): Promise<string> => {
  if (!imageUrl || imageUrl.includes("ui-avatars.com")) return "";

  try {
    const response = await fetch(imageUrl, { mode: "cors" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return "";
  }
};

const StudentsDirectoryPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [courseFilter, setCourseFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [exportOptions, setExportOptions] = useState({
    includePersonal: true,
    includeAcademic: true,
    includeContact: true,
    includeEmergency: true,
    format: "PDF",
    includePhoto: true,
    detailedView: true, // Always detailed view for one per page
    imageQuality: "medium" as "low" | "medium" | "high",
  });
  const [isExporting, setIsExporting] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isFullScreen, setIsFullScreen] = useState(false);

  const router = useRouter();

  // Fetch students data
  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchTerm, statusFilter, courseFilter, sortBy]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/students");
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students data");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStudents = () => {
    let result = [...students];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (student) =>
          student.firstName.toLowerCase().includes(term) ||
          student.lastName.toLowerCase().includes(term) ||
          student.email.toLowerCase().includes(term) ||
          student.studentId.toLowerCase().includes(term) ||
          student.course.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      result = result.filter((student) => student.status === statusFilter);
    }

    // Apply course filter
    if (courseFilter !== "ALL") {
      result = result.filter((student) => student.course === courseFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          );
        case "id":
          return a.studentId.localeCompare(b.studentId);
        case "date":
          return (
            new Date(b.enrollmentdate).getTime() -
            new Date(a.enrollmentdate).getTime()
          );
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredStudents(result);
    setCurrentPage(1);
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailDialogOpen(true);
  };

  const handleViewImage = (imageUrl: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map((s) => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents((prev) => [...prev, studentId]);
    } else {
      setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
    }
  };

  const handleExport = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student to export");
      return;
    }

    setIsExporting(true);
    try {
      const studentsToExport = students.filter((s) =>
        selectedStudents.includes(s.id)
      );

      if (exportOptions.format === "CSV") {
        await exportToCSV(studentsToExport);
      } else {
        await exportToPDF(studentsToExport);
      }

      setIsExportDialogOpen(false);
      toast.success(
        `Exported ${studentsToExport.length} student(s) successfully`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export students");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async (students: Student[]) => {
    const headers = [
      "Student ID",
      "Name",
      "Email",
      "Phone",
      "Course",
      "Status",
      "Enrollment Date",
    ];
    const rows = students.map((student) => [
      student.studentId,
      `${student.firstName} ${student.lastName}`,
      student.email,
      student.phone,
      student.course,
      student.status,
      safeFormatDate(student.enrollmentdate, "yyyy-MM-dd"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `students_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = async (students: Student[]) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Process each student - ONE PER PAGE
    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      // Add new page for each student (except first)
      if (i > 0) {
        doc.addPage();
      }

      await addStudentPage(doc, student, i + 1, students.length);
    }

    // Save the PDF
    doc.save(`students_report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const addStudentPage = async (
    doc: jsPDF,
    student: Student,
    currentPage: number,
    totalPages: number
  ) => {
    // Set default font
    doc.setFont("helvetica");

    // Add header with logo
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 15, "F");

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("STUDENT PROFILE", 105, 10, { align: "center" });

    let yPosition = 25;

    // Add profile image if enabled
    if (exportOptions.includePhoto && student.imageUrl) {
      try {
        const base64 = await getImageBase64(student.imageUrl);
        if (base64) {
          // Add profile image (35x35mm)
          const imageWidth = 35;
          const imageHeight = 35;
          doc.addImage(base64, "JPEG", 20, yPosition, imageWidth, imageHeight);

          // Add student info next to image
          doc.setFontSize(16);
          doc.setTextColor(40, 40, 40);
          doc.setFont("helvetica", "bold");
          doc.text(
            `${student.firstName} ${student.lastName}`,
            65,
            yPosition + 12
          );

          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.setFont("helvetica", "normal");
          doc.text(`ID: ${student.studentId}`, 65, yPosition + 19);
          doc.text(`Course: ${student.course}`, 65, yPosition + 26);

          // Status with colored background
          doc.setFillColor(240, 245, 255);
          doc.rect(65, yPosition + 30, 30, 8, "F");
          doc.setFontSize(9);
          doc.setTextColor(59, 130, 246);
          doc.text(student.status, 80, yPosition + 36, { align: "center" });

          yPosition += 45;
        } else {
          // Fallback if image fails to load
          addStudentInfoWithoutImage(doc, student, yPosition);
          yPosition += 30;
        }
      } catch (error) {
        console.error("Error adding student image:", error);
        addStudentInfoWithoutImage(doc, student, yPosition);
        yPosition += 30;
      }
    } else {
      // Student info without image
      addStudentInfoWithoutImage(doc, student, yPosition);
      yPosition += 30;
    }

    // Add separator
    doc.setDrawColor(220, 220, 220);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;

    // Create two columns for student information
    const columnWidth = 85;
    const leftColumnX = 20;
    const rightColumnX = 105;
    let leftColumnY = yPosition;
    let rightColumnY = yPosition;

    // Personal Information (Left Column)
    if (exportOptions.includePersonal) {
      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246);
      doc.setFont("helvetica", "bold");
      doc.text("PERSONAL INFORMATION", leftColumnX, leftColumnY);
      leftColumnY += 8;

      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "normal");

      const personalInfo = [
        `Date of Birth: ${safeFormatDate(student.dob, "dd/MM/yyyy")}`,
        `Age: ${calculateAge(student.dob)}`,
        `Gender: ${
          genderLabels[student.gender as keyof typeof genderLabels] ||
          student.gender
        }`,
      ];

      personalInfo.forEach((info) => {
        doc.text(info, leftColumnX + 5, leftColumnY);
        leftColumnY += 6;
      });

      leftColumnY += 10;
    }

    // Academic Information (Right Column)
    if (exportOptions.includeAcademic) {
      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246);
      doc.setFont("helvetica", "bold");
      doc.text("ACADEMIC INFORMATION", rightColumnX, rightColumnY);
      rightColumnY += 8;

      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "normal");

      const academicInfo = [
        `Course: ${student.course}`,
        `Status: ${student.status}`,
        `Enrollment Date: ${safeFormatDate(
          student.enrollmentdate,
          "dd/MM/yyyy"
        )}`,
        `Enrollment Duration: ${calculateEnrollmentDuration(
          student.enrollmentdate
        )}`,
      ];

      academicInfo.forEach((info) => {
        doc.text(info, rightColumnX + 5, rightColumnY);
        rightColumnY += 6;
      });

      rightColumnY += 10;
    }

    // Contact Information (Left Column - below personal)
    if (exportOptions.includeContact) {
      // Move to next position in left column
      leftColumnY = Math.max(leftColumnY, yPosition + 60);

      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246);
      doc.setFont("helvetica", "bold");
      doc.text("CONTACT INFORMATION", leftColumnX, leftColumnY);
      leftColumnY += 8;

      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "normal");

      const contactInfo = [
        `Email: ${student.email}`,
        `Phone: ${student.phone}`,
      ];

      contactInfo.forEach((info) => {
        doc.text(info, leftColumnX + 5, leftColumnY);
        leftColumnY += 6;
      });

      leftColumnY += 10;
    }

    // Emergency Contact (Right Column - below academic)
    if (exportOptions.includeEmergency) {
      // Move to next position in right column
      rightColumnY = Math.max(rightColumnY, yPosition + 60);

      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246);
      doc.setFont("helvetica", "bold");
      doc.text("EMERGENCY CONTACT", rightColumnX, rightColumnY);
      rightColumnY += 8;

      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "normal");

      const emergencyInfo = [
        `Name: ${student.emergencyContactName}`,
        `Phone: ${student.emergencyContactPhone}`,
      ];

      emergencyInfo.forEach((info) => {
        doc.text(info, rightColumnX + 5, rightColumnY);
        rightColumnY += 6;
      });
    }

    // Address (Full width below columns)
    const maxColumnY = Math.max(leftColumnY, rightColumnY);
    let addressY = maxColumnY + 10;

    if (student.address && exportOptions.includeContact && addressY < 250) {
      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246);
      doc.setFont("helvetica", "bold");
      doc.text("ADDRESS", 20, addressY);
      addressY += 8;

      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "normal");

      const addressLines = doc.splitTextToSize(student.address, 170);
      addressLines.forEach((line: string) => {
        if (addressY < 270) {
          doc.text(line, 25, addressY);
          addressY += 5;
        }
      });
    }

    // Add footer with page number
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${currentPage} of ${totalPages}`, 105, 285, {
      align: "center",
    });
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      20,
      285,
      { align: "left" }
    );
    doc.text(`Confidential - Student Profile`, 190, 285, { align: "right" });
  };

  const addStudentInfoWithoutImage = (
    doc: jsPDF,
    student: Student,
    yPosition: number
  ) => {
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.text(`${student.firstName} ${student.lastName}`, 20, yPosition);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");

    const infoLines = [
      `Student ID: ${student.studentId}`,
      `Course: ${student.course} | Status: ${student.status}`,
    ];

    infoLines.forEach((line, index) => {
      doc.text(line, 20, yPosition + 8 + index * 6);
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Student Directory
          </h1>
          <p className="text-muted-foreground">
            View and manage all student profiles ({filteredStudents.length}{" "}
            students)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => setIsExportDialogOpen(true)}
            disabled={selectedStudents.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export ({selectedStudents.length})
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="default"
            onClick={() => router.push("/students/add")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Student
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name, ID, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course Filter */}
            <div className="lg:col-span-3">
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <BookOpen className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Courses</SelectItem>
                  {courseOptions.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="lg:col-span-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="id">Student ID</SelectItem>
                  <SelectItem value="date">Enrollment Date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="lg:col-span-1 flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={
                  selectedStudents.length === filteredStudents.length &&
                  filteredStudents.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm">
                Select all {filteredStudents.length} students
              </Label>
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedStudents.length} selected
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid/List View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              isSelected={selectedStudents.includes(student.id)}
              onSelect={handleSelectStudent}
              onViewDetails={handleViewDetails}
              onViewImage={handleViewImage}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left">
                      <Checkbox />
                    </th>
                    <th className="p-4 text-left">Student</th>
                    <th className="p-4 text-left">Student ID</th>
                    <th className="p-4 text-left">Course</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Enrollment Date</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-muted/30">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={(checked) =>
                            handleSelectStudent(student.id, checked as boolean)
                          }
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="relative group cursor-pointer"
                            onClick={() => handleViewImage(student.imageUrl)}
                          >
                            <Avatar className="h-14 w-14 border-2 border-primary/20 hover:border-primary transition-all duration-300">
                              <AvatarImage
                                src={student.imageUrl}
                                alt={`${student.firstName} ${student.lastName}`}
                                className="object-cover hover:scale-110 transition-transform duration-300"
                              />
                              <AvatarFallback className="text-lg">
                                {student.firstName[0]}
                                {student.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full flex items-center justify-center">
                              <Eye className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm">
                        {student.studentId}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="font-normal">
                          {student.course}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          className={`px-3 py-1 ${
                            statusConfig[
                              student.status as keyof typeof statusConfig
                            ]?.color
                          }`}
                        >
                          {
                            statusConfig[
                              student.status as keyof typeof statusConfig
                            ]?.label
                          }
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {safeFormatDate(student.enrollmentdate, "MMM dd, yyyy")}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewDetails(student)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleViewImage(student.imageUrl)
                                  }
                                >
                                  <ImageIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Image</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(`/students/edit/${student.id}`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/students/view/${student.id}`)
                                }
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Full Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewImage(student.imageUrl)
                                }
                              >
                                <ImageIcon className="h-4 w-4 mr-2" />
                                View Full Image
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(student.email);
                                  toast.success("Email copied to clipboard");
                                }}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Copy Email
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(student.phone);
                                  toast.success("Phone copied to clipboard");
                                }}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Copy Phone
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  toast.error(
                                    "Delete functionality not implemented"
                                  );
                                }}
                              >
                                Delete Student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {filteredStudents.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredStudents.length)} of{" "}
            {filteredStudents.length} students
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
                <SelectItem value="96">96</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredStudents.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto max-w-md">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No students found</h3>
              <p className="text-muted-foreground mt-2">
                No students match your current filters. Try adjusting your
                search or filters.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setCourseFilter("ALL");
                }}
                className="mt-4"
              >
                Clear all filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-6">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => handleViewImage(selectedStudent.imageUrl)}
                  >
                    <Avatar className="h-24 w-24 border-4 border-primary/20 hover:border-primary transition-all duration-300">
                      <AvatarImage
                        src={selectedStudent.imageUrl}
                        alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <AvatarFallback className="text-3xl">
                        {selectedStudent.firstName[0]}
                        {selectedStudent.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full flex items-center justify-center">
                      <Maximize2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="font-normal">
                        {selectedStudent.studentId}
                      </Badge>
                      <Badge variant="secondary" className="font-normal">
                        {selectedStudent.course}
                      </Badge>
                      <Badge
                        className={`px-3 py-1 ${
                          statusConfig[
                            selectedStudent.status as keyof typeof statusConfig
                          ]?.color
                        }`}
                      >
                        {
                          statusConfig[
                            selectedStudent.status as keyof typeof statusConfig
                          ]?.label
                        }
                      </Badge>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="emergency">Emergency</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Student ID</Label>
                      <p className="font-semibold">
                        {selectedStudent.studentId}
                      </p>
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <p className="font-semibold">
                        {genderLabels[
                          selectedStudent.gender as keyof typeof genderLabels
                        ] || selectedStudent.gender}
                      </p>
                    </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <p className="font-semibold">
                        {safeFormatDate(selectedStudent.dob, "MMMM dd, yyyy")}
                      </p>
                    </div>
                    <div>
                      <Label>Age</Label>
                      <p className="font-semibold">
                        {calculateAge(selectedStudent.dob)}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Course</Label>
                      <p className="font-semibold">{selectedStudent.course}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge
                        className={`px-3 py-1 ${
                          statusConfig[
                            selectedStudent.status as keyof typeof statusConfig
                          ]?.color
                        }`}
                      >
                        {
                          statusConfig[
                            selectedStudent.status as keyof typeof statusConfig
                          ]?.label
                        }
                      </Badge>
                    </div>
                    <div>
                      <Label>Enrollment Date</Label>
                      <p className="font-semibold">
                        {safeFormatDate(selectedStudent.enrollmentdate)}
                      </p>
                    </div>
                    <div>
                      <Label>Enrollment Duration</Label>
                      <p className="font-semibold">
                        {calculateEnrollmentDuration(
                          selectedStudent.enrollmentdate
                        )}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Email Address</Label>
                      <p className="font-semibold">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <p className="font-semibold">{selectedStudent.phone}</p>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <p className="font-semibold whitespace-pre-line">
                        {selectedStudent.address || "No address provided"}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="emergency" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Emergency Contact Name</Label>
                      <p className="font-semibold">
                        {selectedStudent.emergencyContactName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label>Emergency Contact Phone</Label>
                      <p className="font-semibold">
                        {selectedStudent.emergencyContactPhone || "N/A"}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleViewImage(selectedStudent.imageUrl)}
                  variant="outline"
                  className="gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  View Image
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    router.push(`/students/edit/${selectedStudent.id}`);
                  }}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    router.push(`/students/view/${selectedStudent.id}`);
                  }}
                >
                  View Full Profile
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Students</DialogTitle>
            <DialogDescription>
              Export {selectedStudents.length} selected student(s) - Each
              student on separate page
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Export Format</Label>
              <Select
                value={exportOptions.format}
                onValueChange={(value) =>
                  setExportOptions({ ...exportOptions, format: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">
                    PDF Document (One per page)
                  </SelectItem>
                  <SelectItem value="CSV">CSV Spreadsheet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Printer className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    PDF Export Note
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Each student profile will be exported on a separate A4 page
                    with a clean, professional layout including all selected
                    information.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Include Information</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includePhoto"
                    checked={exportOptions.includePhoto}
                    onCheckedChange={(checked) =>
                      setExportOptions({
                        ...exportOptions,
                        includePhoto: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="includePhoto" className="text-sm">
                    Include Profile Photos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="personal"
                    checked={exportOptions.includePersonal}
                    onCheckedChange={(checked) =>
                      setExportOptions({
                        ...exportOptions,
                        includePersonal: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="personal" className="text-sm">
                    Personal Information
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="academic"
                    checked={exportOptions.includeAcademic}
                    onCheckedChange={(checked) =>
                      setExportOptions({
                        ...exportOptions,
                        includeAcademic: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="academic" className="text-sm">
                    Academic Information
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="contact"
                    checked={exportOptions.includeContact}
                    onCheckedChange={(checked) =>
                      setExportOptions({
                        ...exportOptions,
                        includeContact: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="contact" className="text-sm">
                    Contact Information
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergency"
                    checked={exportOptions.includeEmergency}
                    onCheckedChange={(checked) =>
                      setExportOptions({
                        ...exportOptions,
                        includeEmergency: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="emergency" className="text-sm">
                    Emergency Contact
                  </Label>
                </div>
              </div>
            </div>

            {exportOptions.format === "PDF" && exportOptions.includePhoto && (
              <div className="space-y-4">
                <Label>Image Quality</Label>
                <Select
                  value={exportOptions.imageQuality}
                  onValueChange={(value) =>
                    setExportOptions({
                      ...exportOptions,
                      imageQuality: value as "low" | "medium" | "high",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Fastest Export)</SelectItem>
                    <SelectItem value="medium">Medium (Recommended)</SelectItem>
                    <SelectItem value="high">High (Best Quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export ({selectedStudents.length} pages)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Image View Dialog */}
      <ImageDialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <ImageDialogContent className="max-w-4xl max-h-[90vh] p-0">
          {selectedImage ? (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Student Profile"
                className={`w-full h-auto ${
                  isFullScreen ? "max-h-[85vh] object-contain" : "rounded-lg"
                }`}
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="bg-white/90 hover:bg-white"
                >
                  {isFullScreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = selectedImage;
                    link.download = `student_image_${new Date().getTime()}.jpg`;
                    link.click();
                  }}
                  className="bg-white/90 hover:bg-white"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setImageDialogOpen(false)}
                  className="bg-white/90 hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                Click outside to close • Use buttons to control
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No image available</p>
              </div>
            </div>
          )}
        </ImageDialogContent>
      </ImageDialog>
    </div>
  );
};

// Student Card Component for Grid View
interface StudentCardProps {
  student: Student;
  isSelected: boolean;
  onSelect: (studentId: string, checked: boolean) => void;
  onViewDetails: (student: Student) => void;
  onViewImage: (imageUrl: string, e?: React.MouseEvent) => void;
}

const StudentCard = ({
  student,
  isSelected,
  onSelect,
  onViewDetails,
  onViewImage,
}: StudentCardProps) => {
  const StatusIcon =
    statusConfig[student.status as keyof typeof statusConfig]?.icon || Shield;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/30">
      <CardHeader className="p-0">
        <div className="relative">
          {/* Full Size Student Image with View Button */}
          <div
            className="h-64 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 cursor-pointer"
            onClick={() => onViewImage(student.imageUrl)}
          >
            <div className="relative h-full w-full">
              <img
                src={student.imageUrl}
                alt={`${student.firstName} ${student.lastName}`}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random&size=400`;
                }}
              />
              {/* View Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewImage(student.imageUrl, e);
                  }}
                >
                  <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
                  View Full Image
                </Button>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge
              className={`px-3 py-1.5 shadow-lg backdrop-blur-sm ${
                statusConfig[student.status as keyof typeof statusConfig]?.color
              }`}
            >
              <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
              {statusConfig[student.status as keyof typeof statusConfig]?.label}
            </Badge>
          </div>

          {/* Selection Checkbox */}
          <div className="absolute top-3 left-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) =>
                onSelect(student.id, checked as boolean)
              }
              className="h-5 w-5 bg-white/90 shadow-lg backdrop-blur-sm"
            />
          </div>

          {/* Quick View Button */}
          <div className="absolute top-12 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(student);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Quick View</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Student Name and ID with Image View Button */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold truncate">
                {student.firstName} {student.lastName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <IdCard className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-mono">
                  {student.studentId}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewImage(student.imageUrl)}
              className="h-8 w-8"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm truncate" title={student.email}>
              {student.email}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{student.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="font-normal text-xs">
              {student.course}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Enrolled: {safeFormatDate(student.enrollmentdate, "MMM yyyy")}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <Separator />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center">
            <div className="font-semibold">{calculateAge(student.dob)}</div>
            <div className="text-xs text-muted-foreground">Age</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">
              {calculateEnrollmentDuration(student.enrollmentdate)}
            </div>
            <div className="text-xs text-muted-foreground">Enrolled</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails(student)}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View Details
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewImage(student.imageUrl)}>
                <ImageIcon className="h-4 w-4 mr-2" />
                View Full Image
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(student.email);
                  toast.success("Email copied");
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Copy Email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(student.phone);
                  toast.success("Phone copied");
                }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Copy Phone
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(student.studentId);
                  toast.success("Student ID copied");
                }}
              >
                <IdCard className="h-4 w-4 mr-2" />
                Copy Student ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentsDirectoryPage;
