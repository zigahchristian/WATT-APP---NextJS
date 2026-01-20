"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StudentCard } from "./student-card";
import { Student, TimeSlot } from "./timetable";
import {
  Edit,
  X,
  Check,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface TimetableGridProps {
  timeSlots: TimeSlot[];
  onDragStart: (student: Student, source: string) => void;
  onDragEnd: () => void;
  onDrop: (slotId: string) => void;
  draggedStudent: Student | null;
  onUpdateTimeSlot: (
    slotId: string,
    updates: { day?: string; time?: string },
  ) => void;
  onDeleteTimeSlot: (slotId: string) => void;
  expandedDays: Record<string, boolean>;
  onToggleDayExpansion: (day: string) => void;
  dayColors: Record<string, { text: string; bg: string; lightBg: string }>;
}

export function TimetableGrid({
  timeSlots,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedStudent,
  onUpdateTimeSlot,
  onDeleteTimeSlot,
  expandedDays,
  onToggleDayExpansion,
  dayColors,
}: TimetableGridProps) {
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editDayValue, setEditDayValue] = useState<string>("");
  const [editTimeValue, setEditTimeValue] = useState<string>("");

  const handleStartEdit = (
    slotId: string,
    currentDay: string,
    currentTime: string,
  ) => {
    setEditingSlotId(slotId);
    setEditDayValue(currentDay);
    setEditTimeValue(currentTime);
  };

  const handleSaveEdit = (slotId: string) => {
    if (editDayValue.trim() && editTimeValue.trim()) {
      onUpdateTimeSlot(slotId, {
        day: editDayValue.trim(),
        time: editTimeValue.trim(),
      });
    }
    setEditingSlotId(null);
    setEditDayValue("");
    setEditTimeValue("");
  };

  const handleCancelEdit = () => {
    setEditingSlotId(null);
    setEditDayValue("");
    setEditTimeValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, slotId: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(slotId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, slotId: string) => {
    e.preventDefault();
    onDrop(slotId);
  };

  // Order days of the week
  const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Group slots by day
  const groupedSlots = timeSlots.reduce(
    (acc, slot) => {
      if (!acc[slot.day]) {
        acc[slot.day] = [];
      }
      acc[slot.day].push(slot);
      return acc;
    },
    {} as Record<string, TimeSlot[]>,
  );

  // Sort days according to dayOrder
  const sortedDays = dayOrder.filter((day) => groupedSlots[day]);

  // Add any custom days that aren't in the standard week
  const customDays = Object.keys(groupedSlots).filter(
    (day) => !dayOrder.includes(day),
  );
  const allDays = [...sortedDays, ...customDays];

  return (
    <div className="space-y-6">
      {allDays.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <p className="text-lg font-medium mb-2">No timeslots created yet</p>
          <p className="text-sm text-gray-600">
            Use the form above to add timeslots for any day of the week
          </p>
        </div>
      ) : (
        allDays.map((day) => {
          const daySlots = groupedSlots[day];
          const isExpanded = expandedDays[day] !== false; // Default to true if not set
          const color = dayColors[day] || dayColors["Monday"];

          return (
            <div
              key={day}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Day header with expand/collapse */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onToggleDayExpansion(day)}
                style={{ backgroundColor: color.lightBg }}
              >
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isExpanded ? (
                      <ChevronDown
                        className="h-4 w-4"
                        style={{ color: color.text }}
                      />
                    ) : (
                      <ChevronRight
                        className="h-4 w-4"
                        style={{ color: color.text }}
                      />
                    )}
                  </Button>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: color.text }}
                  >
                    {day}
                  </h2>
                  <span
                    className="text-sm font-medium px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: color.bg,
                      color: color.text,
                    }}
                  >
                    {daySlots.length} slot{daySlots.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {daySlots.reduce(
                    (sum, slot) => sum + slot.students.length,
                    0,
                  )}{" "}
                  students
                </div>
              </div>

              {/* Timeslots for this day */}
              {isExpanded && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`relative bg-white rounded-lg p-4 min-h-[180px] border-2 border-dashed transition-colors ${
                          draggedStudent && draggedStudent.id
                            ? "border-blue-300"
                            : "border-gray-200"
                        } hover:border-gray-300`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, slot.id)}
                      >
                        <div className="space-y-3 mb-3">
                          {/* Day and Time display/edit */}
                          <div>
                            {editingSlotId === slot.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editDayValue}
                                  onChange={(e) =>
                                    setEditDayValue(e.target.value)
                                  }
                                  onKeyDown={(e) => handleKeyDown(e, slot.id)}
                                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Day (e.g., Monday)"
                                  autoFocus
                                />
                                <input
                                  type="text"
                                  value={editTimeValue}
                                  onChange={(e) =>
                                    setEditTimeValue(e.target.value)
                                  }
                                  onKeyDown={(e) => handleKeyDown(e, slot.id)}
                                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Time (e.g., 9:00 - 11:00)"
                                />
                                <div className="flex items-center gap-2 pt-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSaveEdit(slot.id)}
                                    className="h-7 w-7 p-0 hover:bg-green-50"
                                  >
                                    <Check className="h-3.5 w-3.5 text-green-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    className="h-7 w-7 p-0 hover:bg-red-50"
                                  >
                                    <X className="h-3.5 w-3.5 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-gray-700">
                                    {slot.time}
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleStartEdit(
                                          slot.id,
                                          slot.day,
                                          slot.time,
                                        )
                                      }
                                      className="h-6 w-6 p-0 hover:bg-blue-50"
                                      title="Edit timeslot"
                                    >
                                      <Edit className="h-3 w-3 text-gray-400 hover:text-blue-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onDeleteTimeSlot(slot.id)}
                                      className="h-6 w-6 p-0 hover:bg-red-50"
                                      title="Delete timeslot"
                                    >
                                      <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-600" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div></div>
                            <div
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                backgroundColor: color.bg,
                                color: color.text,
                              }}
                            >
                              {slot.students.length} student
                              {slot.students.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {slot.students.map((student) => (
                            <StudentCard
                              key={student.id}
                              student={student}
                              onDragStart={() => onDragStart(student, slot.id)}
                              onDragEnd={onDragEnd}
                              compact
                            />
                          ))}
                          {slot.students.length === 0 && (
                            <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-300 rounded">
                              Drag students here
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Empty state for days without slots */}
      {allDays.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">
            Timeslots are automatically grouped by day. Click on a day header to
            expand/collapse.
          </p>
        </div>
      )}
    </div>
  );
}
