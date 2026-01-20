"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { StudentList } from "./student-list";
import { TimetableGrid } from "./timetable-grid";
import { Download, RotateCcw, Save, Plus, Trash2 } from "lucide-react";
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
  day: string;
  time: string;
  students: Student[];
}

// Update interface to match API structure
interface TimetableData {
  id?: string;
  timeSlots: TimeSlot[];
  allStudents?: Student[];
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
    }),
  );
}

// Default days of the week
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Day colors for consistent styling
const dayColors: Record<string, { text: string; bg: string; lightBg: string }> =
  {
    Monday: { text: "#3b82f6", bg: "#dbeafe", lightBg: "#eff6ff" },
    Tuesday: { text: "#8b5cf6", bg: "#e9d5ff", lightBg: "#f5f3ff" },
    Wednesday: { text: "#10b981", bg: "#d1fae5", lightBg: "#ecfdf5" },
    Thursday: { text: "#f59e0b", bg: "#fef3c7", lightBg: "#fffbeb" },
    Friday: { text: "#ef4444", bg: "#fee2e2", lightBg: "#fef2f2" },
    Saturday: { text: "#ec4899", bg: "#fce7f3", lightBg: "#fdf2f8" },
    Sunday: { text: "#14b8a6", bg: "#ccfbf1", lightBg: "#f0fdfa" },
  };

// Initial time slots for each day
const initialTimeSlots: TimeSlot[] = [
  // Monday
  { id: "mon-morning", day: "Monday", time: "9:00 - 11:00", students: [] },
  { id: "mon-afternoon", day: "Monday", time: "13:00 - 15:00", students: [] },
  { id: "mon-evening", day: "Monday", time: "17:00 - 19:00", students: [] },

  // Tuesday
  { id: "tue-morning", day: "Tuesday", time: "9:00 - 11:00", students: [] },
  { id: "tue-afternoon", day: "Tuesday", time: "13:00 - 15:00", students: [] },
  { id: "tue-evening", day: "Tuesday", time: "17:00 - 19:00", students: [] },

  // Wednesday
  { id: "wed-morning", day: "Wednesday", time: "9:00 - 11:00", students: [] },
  {
    id: "wed-afternoon",
    day: "Wednesday",
    time: "13:00 - 15:00",
    students: [],
  },
  { id: "wed-evening", day: "Wednesday", time: "17:00 - 19:00", students: [] },

  // Thursday
  { id: "thu-morning", day: "Thursday", time: "9:00 - 11:00", students: [] },
  { id: "thu-afternoon", day: "Thursday", time: "13:00 - 15:00", students: [] },
  { id: "thu-evening", day: "Thursday", time: "17:00 - 19:00", students: [] },

  // Friday
  { id: "fri-morning", day: "Friday", time: "9:00 - 11:00", students: [] },
  { id: "fri-afternoon", day: "Friday", time: "13:00 - 15:00", students: [] },
  { id: "fri-evening", day: "Friday", time: "17:00 - 19:00", students: [] },

  // Saturday
  { id: "sat-morning", day: "Saturday", time: "9:00 - 11:00", students: [] },
  { id: "sat-afternoon", day: "Saturday", time: "13:00 - 15:00", students: [] },
  { id: "sat-evening", day: "Saturday", time: "17:00 - 19:00", students: [] },

  // Sunday
  { id: "sun-morning", day: "Sunday", time: "9:00 - 11:00", students: [] },
  { id: "sun-afternoon", day: "Sunday", time: "13:00 - 15:00", students: [] },
  { id: "sun-evening", day: "Sunday", time: "17:00 - 19:00", students: [] },
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
  const [newSlotDay, setNewSlotDay] = useState<string>("Monday");
  const [newSlotTime, setNewSlotTime] = useState<string>("");
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: true,
    Sunday: true,
  });
  const timetableRef = useRef<HTMLDivElement>(null);

  // Helper to calculate available students
  const updateAvailableStudents = useCallback(
    (slots: TimeSlot[], allStuds: Student[]) => {
      const studentsInSlots = slots.flatMap((slot) => slot.students);
      const studentIdsInSlots = new Set(studentsInSlots.map((s) => s.id));

      const remainingStudents = allStuds.filter(
        (student) => !studentIdsInSlots.has(student.id),
      );

      return remainingStudents;
    },
    [],
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
        let savedTimeSlots = initialTimeSlots;

        try {
          const timetableResponse = await axios.get("/api/timetable");

          if (timetableResponse.data && timetableResponse.data.timeSlots) {
            const dbTimeSlots = timetableResponse.data.timeSlots as TimeSlot[];
            if (Array.isArray(dbTimeSlots) && dbTimeSlots.length > 0) {
              savedTimeSlots = dbTimeSlots;

              // Check if we need to merge with current student data
              const allStudentIds = new Set(
                transformedStudents.map((s) => s.id),
              );
              savedTimeSlots = savedTimeSlots.map((slot) => ({
                ...slot,
                students: slot.students.filter((student) =>
                  allStudentIds.has(student.id),
                ),
              }));
            }
          } else {
            console.log(
              "No existing timetable found in database, will start fresh",
            );
          }
        } catch (timetableError: any) {
          // This is expected on first load - no timetable exists yet
          console.log(
            "No timetable in database yet (first load):",
            timetableError.message,
          );
          // Don't throw error here, just continue with fresh data
        }

        // 3. Set the state with either saved data or fresh data
        setAllStudents(transformedStudents);
        setTimeSlots(savedTimeSlots);

        // 4. Calculate available students
        const availableStudents = updateAvailableStudents(
          savedTimeSlots,
          transformedStudents,
        );
        setStudents(availableStudents);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          `Failed to load data: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchAllData();
  }, [updateAvailableStudents]);

  // Save timetable to database whenever timeSlots change
  useEffect(() => {
    // Don't save on initial load or if no students loaded yet
    if (isLoading || isInitialLoad || allStudents.length === 0) {
      return;
    }

    // Don't save if it's just the initial empty state
    const hasAnyStudentsInSlots = timeSlots.some(
      (slot) => slot.students.length > 0,
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
        };

        // Use POST to upsert the "main" timetable - matches your API structure
        await axios.post("/api/timetable", timetableData);

        setHasChanges(false);
      } catch (error) {
        console.error("Error auto-saving timetable:", error);
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
                  (s) => s.id !== draggedStudent.id,
                ),
              }
            : slot,
        ),
      );
    }

    // Add student to the target slot
    setTimeSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? { ...slot, students: [...slot.students, draggedStudent] }
          : slot,
      ),
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
                  (s) => s.id !== draggedStudent.id,
                ),
              }
            : slot,
        ),
      );
    }

    // Add student back to available list
    setStudents((prev) => [...prev, draggedStudent]);
    handleDragEnd();
  };

  // Handle timeslot update (both day and time)
  const handleUpdateTimeSlot = (
    slotId: string,
    updates: { day?: string; time?: string },
  ) => {
    setTimeSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              day: updates.day !== undefined ? updates.day : slot.day,
              time: updates.time !== undefined ? updates.time : slot.time,
            }
          : slot,
      ),
    );
  };

  // Handle delete timeslot
  const handleDeleteTimeSlot = (slotId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this timeslot? All students in this slot will be moved back to the available list.",
      )
    ) {
      return;
    }

    const slotToDelete = timeSlots.find((slot) => slot.id === slotId);
    if (!slotToDelete) return;

    // Move students back to available list
    if (slotToDelete.students.length > 0) {
      setStudents((prev) => [...prev, ...slotToDelete.students]);
    }

    // Remove the timeslot
    setTimeSlots((prev) => prev.filter((slot) => slot.id !== slotId));
  };

  // Handle create new timeslot
  const handleCreateTimeSlot = () => {
    if (!newSlotDay.trim() || !newSlotTime.trim()) {
      alert("Please enter both day and time for the new slot");
      return;
    }

    const newSlotId = `${newSlotDay.toLowerCase().slice(0, 3)}-${Date.now()}`;
    const newSlot: TimeSlot = {
      id: newSlotId,
      day: newSlotDay.trim(),
      time: newSlotTime.trim(),
      students: [],
    };

    setTimeSlots((prev) => [...prev, newSlot]);

    // Ensure the day is expanded when adding a new slot
    setExpandedDays((prev) => ({
      ...prev,
      [newSlotDay.trim()]: true,
    }));
  };

  // Toggle day expansion
  const toggleDayExpansion = (day: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset the timetable? This will clear all assignments and reset to default timeslots.",
      )
    ) {
      return;
    }

    // Reset to initial state
    const resetTimeSlots = initialTimeSlots.map((slot) => ({
      ...slot,
      students: [],
    }));
    setTimeSlots(resetTimeSlots);

    // Delete the timetable from database by saving empty slots
    try {
      await axios.post("/api/timetable", { timeSlots: resetTimeSlots });

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

      try {
        const timetableResponse = await axios.get("/api/timetable");

        if (timetableResponse.data && timetableResponse.data.timeSlots) {
          const dbTimeSlots = timetableResponse.data.timeSlots as TimeSlot[];
          if (Array.isArray(dbTimeSlots) && dbTimeSlots.length > 0) {
            savedTimeSlots = dbTimeSlots;

            // Filter out students that no longer exist
            const allStudentIds = new Set(transformedStudents.map((s) => s.id));
            savedTimeSlots = savedTimeSlots.map((slot) => ({
              ...slot,
              students: slot.students.filter((student) =>
                allStudentIds.has(student.id),
              ),
            }));
          }
        }
      } catch (timetableError) {
        console.log("No timetable found, using fresh data");
      }

      // Set all state
      setAllStudents(transformedStudents);
      setTimeSlots(savedTimeSlots);

      // Calculate available students
      const availableStudents = updateAvailableStudents(
        savedTimeSlots,
        transformedStudents,
      );
      setStudents(availableStudents);
    } catch (error) {
      setError(
        `Failed to fetch data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
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
    pdf.text("WATT PROFESSIONAL STUDIES - Timetable", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 15;

    // Group timeslots by day in order of the week
    const orderedDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const daysWithSlots = orderedDays.filter((day) =>
      timeSlots.some((slot) => slot.day === day),
    );

    daysWithSlots.forEach((day, dayIndex) => {
      const daySlots = timeSlots.filter((slot) => slot.day === day);
      const color = dayColors[day] || dayColors["Monday"];

      // Day section
      pdf.setFontSize(14);
      pdf.setTextColor(color.text);
      pdf.text(day, 15, yPos);
      yPos += 8;

      const slotWidth = (pageWidth - 30) / Math.min(daySlots.length, 5);
      const slotHeight = 40;

      // Draw slots for this day
      daySlots.forEach((slot, index) => {
        if (index < 5) {
          // Max 5 slots per row
          const xPos = 15 + index * slotWidth;

          // Slot background
          pdf.setFillColor(249, 250, 251);
          pdf.setDrawColor(229, 231, 235);
          pdf.roundedRect(xPos, yPos, slotWidth - 4, slotHeight, 2, 2, "FD");

          // Time header
          pdf.setFontSize(8);
          pdf.setTextColor(107, 114, 128);
          pdf.text(slot.time, xPos + (slotWidth - 4) / 2, yPos + 6, {
            align: "center",
          });

          // Students
          let studentY = yPos + 12;
          slot.students.forEach((student) => {
            if (studentY < yPos + slotHeight - 6) {
              pdf.setFillColor(student.bgHex);
              pdf.setDrawColor(student.borderHex);
              pdf.roundedRect(xPos + 2, studentY, slotWidth - 8, 8, 1, 1, "FD");

              pdf.setFontSize(6);
              pdf.setTextColor(student.textHex);
              pdf.text(student.name.substring(0, 12), xPos + 4, studentY + 3.5);
              studentY += 9;
            }
          });
        }
      });

      yPos += slotHeight + 10;

      // Start new page if running out of space
      if (yPos > 250 && dayIndex < daysWithSlots.length - 1) {
        pdf.addPage();
        yPos = 15;
      }
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

      {/* Create new timeslot form */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Add New Timeslot
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Day:</label>
            <select
              value={newSlotDay}
              onChange={(e) => setNewSlotDay(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Time:</label>
            <input
              type="text"
              value={newSlotTime}
              onChange={(e) => setNewSlotTime(e.target.value)}
              placeholder="e.g., 9:00 - 11:00"
              className="px-3 py-2 border rounded-md text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button onClick={handleCreateTimeSlot} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Timeslot
          </Button>
          <div className="text-sm text-gray-500 ml-auto">
            {timeSlots.length} total slots •{" "}
            {
              daysOfWeek.filter((day) =>
                timeSlots.some((slot) => slot.day === day),
              ).length
            }{" "}
            days with slots
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
            onUpdateTimeSlot={handleUpdateTimeSlot}
            onDeleteTimeSlot={handleDeleteTimeSlot}
            expandedDays={expandedDays}
            onToggleDayExpansion={toggleDayExpansion}
            dayColors={dayColors}
          />
        </div>
      </div>
    </div>
  );
}

export { createStudent };
