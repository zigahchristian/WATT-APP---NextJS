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
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Users,
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ClipboardList,
  UserCheck,
} from "lucide-react";
import { AttendanceForm } from "./AttendanceForm"; // form for add/edit
import { BulkAttendance } from "./BulkAttendance";
import { AttendanceStats } from "./AttendanceStats";
import { AttendanceConfig } from "./AttendanceConfig";
import axios from "axios";

interface StudentI {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;

  dob: Date;
  email: string;
  phone: string;
  address: string;

  enrollmentdate: Date;
  course: string;

  // Optional fields
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  imageUrl?: string;
}

interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: "Present" | "Absent" | "Late" | "Excused";
  subject: string;
  remarks?: string;
  createdAt: string;
  student: StudentI;
}

export function AttendanceSystem() {
  const [activeTab, setActiveTab] = useState("records");
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<StudentI[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | undefined>();
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState("");

  // Modals
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showBulkAttendance, setShowBulkAttendance] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(
    null,
  );

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [a, s] = await Promise.all([
        axios.get("/api/attendance"),
        axios.get("/api/students"),
      ]);
      setAttendance(a.data);
      setStudents(s.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save attendance (add or edit)
  const handleSaveAttendance = async (attendanceData: any) => {
    try {
      if (editingAttendance) {
        // edit
        await axios.put(
          `/api/attendance?id=${editingAttendance.id}`,
          attendanceData,
        );
      } else {
        // add
        await axios.post("/api/attendance", attendanceData);
      }
      await fetchData();
      setShowAttendanceForm(false);
      setEditingAttendance(null);
    } catch (error: any) {
      if (error.response?.status === 409) {
        alert(
          "Attendance record already exists for this student/date/subject.",
        );
      } else {
        console.error("Error saving attendance:", error);
      }
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attendance record?"))
      return;

    try {
      await axios.delete(`/api/attendance?id=${id}`);
      await fetchData();
    } catch (error) {
      console.error("Error deleting attendance:", error);
    }
  };

  // Filtered records
  const filteredAttendance = attendance.filter((r) => {
    return (
      (!selectedStudent || r.studentId === selectedStudent) &&
      (!selectedSubject || r.subject === selectedSubject) &&
      (!selectedStatus || r.status === selectedStatus) &&
      (!selectedDate ||
        new Date(r.date).toDateString() ===
          new Date(selectedDate).toDateString()) &&
      (searchTerm === "" ||
        r.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const subjects = [...new Set(attendance.map((a) => a.subject))];

  const getStatusColor = (status: string) =>
    ({
      Present: "bg-green-100 text-green-800",
      Absent: "bg-red-100 text-red-800",
      Late: "bg-yellow-100 text-yellow-800",
      Excused: "bg-blue-100 text-blue-800",
    })[status] ?? "bg-gray-100 text-gray-800";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="h-4 w-4" />;
      case "Absent":
        return <XCircle className="h-4 w-4" />;
      case "Late":
        return <Clock className="h-4 w-4" />;
      case "Excused":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) return <p className="text-center py-10">Loading attendance…</p>;

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Attendance System</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowBulkAttendance(true)} variant="outline">
            <Users className="h-4 w-4" /> Bulk Attendance
          </Button>
          <Button
            onClick={() => {
              setEditingAttendance(null);
              setShowAttendanceForm(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add Attendance
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label>Search</Label>
                <Input
                  placeholder="Search by name or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <Label>Student</Label>
                <Select
                  value={selectedStudent}
                  onValueChange={setSelectedStudent}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All students" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Subject</Label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                    <SelectItem value="Late">Late</SelectItem>
                    <SelectItem value="Excused">Excused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                {filteredAttendance.length} record
                {filteredAttendance.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        {r.student.firstName} {r.student.lastName}
                      </TableCell>
                      <TableCell>
                        {new Date(r.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{r.subject}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(r.status)}>
                          {getStatusIcon(r.status)} {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAttendance(r);
                              setShowAttendanceForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAttendance(r.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <AttendanceStats />
        </TabsContent>
        <TabsContent value="calendar">
          <div className="text-center py-10 text-gray-500">
            <CalendarDays className="mx-auto h-10 w-10" />
            Calendar view coming soon
          </div>
        </TabsContent>
        <TabsContent value="config">
          <AttendanceConfig />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Attendance Modal */}
      {showAttendanceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingAttendance ? "Edit Attendance" : "Add Attendance"}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAttendanceForm(false);
                    setEditingAttendance(null);
                  }}
                >
                  ✕
                </Button>
              </div>
              <AttendanceForm
                attendance={editingAttendance}
                students={students}
                onSave={handleSaveAttendance}
                onCancel={() => {
                  setShowAttendanceForm(false);
                  setEditingAttendance(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Attendance Modal */}
      {showBulkAttendance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Bulk Attendance</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBulkAttendance(false)}
                >
                  ✕
                </Button>
              </div>
              <BulkAttendance
                students={students}
                onSave={() => {
                  setShowBulkAttendance(false);
                  fetchData();
                }}
                onCancel={() => setShowBulkAttendance(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
