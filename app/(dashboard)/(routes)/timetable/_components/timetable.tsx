"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { StudentList } from "./student-list";
import { TimetableGrid } from "./timetable-grid";
import { Download, RotateCcw, Save } from "lucide-react";
import jsPDF from "jspdf";
import { generateStudentColors } from "@/lib/color-utils";
import axios from "axios";

// Define the actual data structure from your API
type RawStudent = {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  dob: string;
  email: string;
  phone: string;
  address: string;
  course: string;
  enrollmentdate: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  imageUrl: string;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED";
  createdAt?: string;
  updatedAt?: string;
};

export interface Student {
  id: string;
  name: string;
  subject: string;
  color: string;
  bgHex: string;
  textHex: string;
  borderHex: string;
}

export interface TimeSlot {
  id: string;
  day: "Saturday" | "Sunday";
  time: string;
  students: Student[];
}

// Add interface for Timetable data from database
interface TimetableData {
  id?: string;
  timeSlots: TimeSlot[];
  allStudents: Student[];
  createdAt?: string;
  updatedAt?: string;
}

function createStudent(id: string, name: string, subject: string): Student {
  const colors = generateStudentColors(name);
  return {
    id,
    name,
    subject,
    color: colors.tailwind,
    bgHex: colors.bgHex,
    textHex: colors.textHex,
    borderHex: colors.borderHex,
  };
}

// Helper function to transform raw API data to Student type
function transformStudentData(rawData: RawStudent[]): Student[] {
  return rawData.map(
    (student): Student => ({
      id: student.id || student.studentId,
      name: `${student.firstName} ${student.lastName}`.trim(),
      subject: student.course || "General",
      color: generateStudentColors(student.firstName).tailwind,
      bgHex: generateStudentColors(student.firstName).bgHex,
      textHex: generateStudentColors(student.firstName).textHex,
      borderHex: generateStudentColors(student.firstName).borderHex,
    })
  );
}

const initialTimeSlots: TimeSlot[] = [
  { id: "sat-1", day: "Saturday", time: "8:30 - 10:30", students: [] },
  { id: "sat-2", day: "Saturday", time: "11:00 - 1:00", students: [] },
  { id: "sat-3", day: "Saturday", time: "1:30 - 3:30", students: [] },
  { id: "sat-4", day: "Saturday", time: "4:00 - 6:00", students: [] },
  { id: "sat-5", day: "Saturday", time: "6:30 - 8:30", students: [] },
  { id: "sun-1", day: "Sunday", time: "6:30 - 8:30", students: [] },
];

export function Timetable() {
  const [draggedStudent, setDraggedStudent] = useState<Student | null>(null);
  const [dragSource, setDragSource] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(initialTimeSlots);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const timetableRef = useRef<HTMLDivElement>(null);

  // Helper to calculate available students
  const updateAvailableStudents = useCallback(
    (slots: TimeSlot[], allStuds: Student[]) => {
      const studentsInSlots = slots.flatMap((slot) => slot.students);
      const studentIdsInSlots = new Set(studentsInSlots.map((s) => s.id));

      const remainingStudents = allStuds.filter(
        (student) => !studentIdsInSlots.has(student.id)
      );

      return remainingStudents;
    },
    []
  );

  // Update students list when timeSlots or allStudents change
  useEffect(() => {
    if (allStudents.length === 0) return;

    const remainingStudents = updateAvailableStudents(timeSlots, allStudents);
    setStudents(remainingStudents);
  }, [timeSlots, allStudents, updateAvailableStudents]);

  // Load initial data from both API (students) and database (timetable)
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch students from API

        const studentsResponse = await axios.get("/api/students");

        if (!studentsResponse.data) {
          throw new Error("No student data received from API");
        }

        const rawStudents: RawStudent[] = studentsResponse.data;

        if (!Array.isArray(rawStudents)) {
          throw new Error("Invalid student data format: expected an array");
        }

        const transformedStudents = transformStudentData(rawStudents);

        // 2. Try to fetch timetable from database
        let savedTimetable = null;
        let savedTimeSlots = initialTimeSlots;
        let savedAllStudents = transformedStudents;

        try {
          const timetableResponse = await axios.get("/api/timetable");

          if (timetableResponse.data && timetableResponse.data.timeSlots) {
            savedTimetable = timetableResponse.data;

            // Parse the timeSlots from database
            const dbTimeSlots = savedTimetable.timeSlots as TimeSlot[];
            if (Array.isArray(dbTimeSlots)) {
              savedTimeSlots = dbTimeSlots;
            }

            // If we have stored allStudents in database, use them
            const dbAllStudents = savedTimetable.allStudents as Student[];
            if (Array.isArray(dbAllStudents) && dbAllStudents.length > 0) {
              savedAllStudents = dbAllStudents;
            }
          } else {
            console.log(
              "No existing timetable found in database, will start fresh"
            );
          }
        } catch (timetableError: any) {
          // This is expected on first load - no timetable exists yet
          console.log(
            "No timetable in database yet (first load):",
            timetableError.message
          );
          // Don't throw error here, just continue with fresh data
        }

        // 3. Set the state with either saved data or fresh data
        setAllStudents(savedAllStudents);
        setTimeSlots(savedTimeSlots);

        // 4. Calculate available students
        const availableStudents = updateAvailableStudents(
          savedTimeSlots,
          savedAllStudents
        );
        setStudents(availableStudents);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          `Failed to load data: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchAllData();
  }, [updateAvailableStudents]);

  // Save timetable to database whenever timeSlots or allStudents change
  useEffect(() => {
    // Don't save on initial load or if no students loaded yet
    if (isLoading || isInitialLoad || allStudents.length === 0) {
      return;
    }

    // Don't save if it's just the initial empty state
    const hasAnyStudentsInSlots = timeSlots.some(
      (slot) => slot.students.length > 0
    );
    if (!hasAnyStudentsInSlots && students.length === allStudents.length) {
      // This is the initial empty state, don't save
      return;
    }

    const saveTimetable = async () => {
      setIsSaving(true);
      try {
        const timetableData: TimetableData = {
          timeSlots,
          allStudents,
        };

        // Use POST to upsert the "main" timetable
        await axios.post("/api/timetable", timetableData);

        setHasChanges(false);
      } catch (error) {
      } finally {
        setIsSaving(false);
      }
    };

    // Debounce the auto-save to prevent too many API calls
    const timeoutId = setTimeout(saveTimetable, 2000);
    return () => clearTimeout(timeoutId);
  }, [timeSlots, allStudents, isLoading, isInitialLoad]);

  // Set hasChanges when timeSlots change (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad && allStudents.length > 0) {
      setHasChanges(true);
    }
  }, [timeSlots, allStudents, isInitialLoad]);

  const handleDragStart = (student: Student, source: string) => {
    setDraggedStudent(student);
    setDragSource(source);
  };

  const handleDragEnd = () => {
    setDraggedStudent(null);
    setDragSource(null);
  };

  const handleDropOnSlot = (slotId: string) => {
    if (!draggedStudent) return;

    if (dragSource === "list") {
      // Student is being dragged from the list to a slot
      setStudents((prev) => prev.filter((s) => s.id !== draggedStudent.id));
    } else if (dragSource) {
      // Student is being dragged from one slot to another
      setTimeSlots((prev) =>
        prev.map((slot) =>
          slot.id === dragSource
            ? {
                ...slot,
                students: slot.students.filter(
                  (s) => s.id !== draggedStudent.id
                ),
              }
            : slot
        )
      );
    }

    // Add student to the target slot
    setTimeSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? { ...slot, students: [...slot.students, draggedStudent] }
          : slot
      )
    );

    handleDragEnd();
  };

  const handleDropOnList = () => {
    if (!draggedStudent || dragSource === "list") return;

    if (dragSource) {
      // Remove student from the source slot
      setTimeSlots((prev) =>
        prev.map((slot) =>
          slot.id === dragSource
            ? {
                ...slot,
                students: slot.students.filter(
                  (s) => s.id !== draggedStudent.id
                ),
              }
            : slot
        )
      );
    }

    // Add student back to available list
    setStudents((prev) => [...prev, draggedStudent]);
    handleDragEnd();
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset the timetable? This will clear all assignments."
      )
    ) {
      return;
    }

    // Reset to initial state
    setTimeSlots(initialTimeSlots);

    // Delete the timetable from database
    try {
      await axios.delete("/api/timetable");

      // Fetch fresh students again
      const studentsResponse = await axios.get("/api/students");
      const rawStudents: RawStudent[] = studentsResponse.data;
      const transformedStudents = transformStudentData(rawStudents);
      setAllStudents(transformedStudents);
      setStudents(transformedStudents);

      setHasChanges(false);
    } catch (error) {
      console.error("Error resetting timetable:", error);
    }
  };

  const handleManualSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const timetableData: TimetableData = {
        timeSlots,
        allStudents,
      };

      await axios.post("/api/timetable", timetableData);

      setHasChanges(false);
    } catch (error) {
      console.error("Error manually saving timetable:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetryFetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch fresh students
      const studentsResponse = await axios.get("/api/students");
      const rawStudents: RawStudent[] = studentsResponse.data;
      const transformedStudents = transformStudentData(rawStudents);

      // Try to fetch timetable
      let savedTimeSlots = initialTimeSlots;
      let savedAllStudents = transformedStudents;

      try {
        const timetableResponse = await axios.get("/api/timetable");

        if (timetableResponse.data && timetableResponse.data.timeSlots) {
          const dbTimeSlots = timetableResponse.data.timeSlots as TimeSlot[];
          if (Array.isArray(dbTimeSlots)) {
            savedTimeSlots = dbTimeSlots;
          }

          const dbAllStudents = timetableResponse.data.allStudents as Student[];
          if (Array.isArray(dbAllStudents) && dbAllStudents.length > 0) {
            savedAllStudents = dbAllStudents;
          }
        }
      } catch (timetableError) {
        console.log("No timetable found, using fresh data");
      }

      // Set all state
      setAllStudents(savedAllStudents);
      setTimeSlots(savedTimeSlots);

      // Calculate available students
      const availableStudents = updateAvailableStudents(
        savedTimeSlots,
        savedAllStudents
      );
      setStudents(availableStudents);
    } catch (error) {
      setError(
        `Failed to fetch data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPos = 15;

    // Title
    pdf.setFontSize(18);
    pdf.setTextColor(30, 30, 30);
    pdf.text("WATT PROFFESSIONAL STUDIES - Timetable", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 15;

    const saturdaySlots = timeSlots.filter((slot) => slot.day === "Saturday");
    const sundaySlots = timeSlots.filter((slot) => slot.day === "Sunday");

    // Saturday section
    pdf.setFontSize(14);
    pdf.setTextColor(59, 130, 246); // blue
    pdf.text("Saturday", 15, yPos);
    yPos += 8;

    const slotWidth = (pageWidth - 30) / 5;
    const slotHeight = 50;

    // Draw Saturday slots
    saturdaySlots.forEach((slot, index) => {
      const xPos = 15 + index * slotWidth;

      // Slot background
      pdf.setFillColor(249, 250, 251);
      pdf.setDrawColor(229, 231, 235);
      pdf.roundedRect(xPos, yPos, slotWidth - 4, slotHeight, 2, 2, "FD");

      // Time header
      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128);
      pdf.text(slot.time, xPos + (slotWidth - 4) / 2, yPos + 6, {
        align: "center",
      });

      // Students
      let studentY = yPos + 12;
      slot.students.forEach((student) => {
        if (studentY < yPos + slotHeight - 8) {
          pdf.setFillColor(student.bgHex);
          pdf.setDrawColor(student.borderHex);
          pdf.roundedRect(xPos + 2, studentY, slotWidth - 8, 10, 1, 1, "FD");

          pdf.setFontSize(7);
          pdf.setTextColor(student.textHex);
          pdf.text(student.name, xPos + 4, studentY + 4);
          pdf.setFontSize(6);
          pdf.text(student.subject, xPos + 4, studentY + 8);
          studentY += 12;
        }
      });
    });

    yPos += slotHeight + 15;

    // Sunday section
    pdf.setFontSize(14);
    pdf.setTextColor(249, 115, 22); // orange
    pdf.text("Sunday", 15, yPos);
    yPos += 8;

    // Draw Sunday slots
    sundaySlots.forEach((slot, index) => {
      const xPos = 15 + index * slotWidth;

      pdf.setFillColor(249, 250, 251);
      pdf.setDrawColor(229, 231, 235);
      pdf.roundedRect(xPos, yPos, slotWidth - 4, slotHeight, 2, 2, "FD");

      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128);
      pdf.text(slot.time, xPos + (slotWidth - 4) / 2, yPos + 6, {
        align: "center",
      });

      let studentY = yPos + 12;
      slot.students.forEach((student) => {
        if (studentY < yPos + slotHeight - 8) {
          pdf.setFillColor(student.bgHex);
          pdf.setDrawColor(student.borderHex);
          pdf.roundedRect(xPos + 2, studentY, slotWidth - 8, 10, 1, 1, "FD");

          pdf.setFontSize(7);
          pdf.setTextColor(student.textHex);
          pdf.text(student.name, xPos + 4, studentY + 4);
          pdf.setFontSize(6);
          pdf.text(student.subject, xPos + 4, studentY + 8);
          studentY += 12;
        }
      });
    });

    pdf.save("timetable.pdf");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading timetable data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="text-red-600">Error: {error}</div>
          <Button onClick={handleRetryFetch}>Retry Loading</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleDownloadPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button
          onClick={handleManualSave}
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : hasChanges ? "Save Changes" : "Saved"}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="gap-2 bg-transparent"
        >
          <RotateCcw className="h-4 w-4" />
          Reset All
        </Button>

        <div className="ml-auto flex items-center gap-4">
          {hasChanges && (
            <span className="text-sm text-amber-600 animate-pulse">
              • Unsaved changes
            </span>
          )}
          {isSaving && <span className="text-sm text-blue-600">Saving...</span>}
          <div className="text-sm text-gray-500">
            {allStudents.length} total students • {students.length} available •{" "}
            {timeSlots.reduce((sum, slot) => sum + slot.students.length, 0)} in
            timetable
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <StudentList
          students={students}
          onDragStart={(student) => handleDragStart(student, "list")}
          onDragEnd={handleDragEnd}
          onDrop={handleDropOnList}
          isDraggingOver={dragSource !== "list" && dragSource !== null}
        />

        <div ref={timetableRef}>
          <TimetableGrid
            timeSlots={timeSlots}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDropOnSlot}
            draggedStudent={draggedStudent}
          />
        </div>
      </div>
    </div>
  );
}

export { createStudent };
