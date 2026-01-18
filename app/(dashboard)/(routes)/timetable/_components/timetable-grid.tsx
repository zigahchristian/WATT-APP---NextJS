"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StudentCard } from "./student-card";
import { Student, TimeSlot } from "./timetable";
import { Edit, X, Check, Trash2 } from "lucide-react";

interface TimetableGridProps {
  timeSlots: TimeSlot[];
  onDragStart: (student: Student, source: string) => void;
  onDragEnd: () => void;
  onDrop: (slotId: string) => void;
  draggedStudent: Student | null;
  onUpdateTimeSlot: (
    slotId: string,
    updates: { day?: string; time?: string }
  ) => void;
  onDeleteTimeSlot: (slotId: string) => void;
}

export function TimetableGrid({
  timeSlots,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedStudent,
  onUpdateTimeSlot,
  onDeleteTimeSlot,
}: TimetableGridProps) {
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editDayValue, setEditDayValue] = useState<string>("");
  const [editTimeValue, setEditTimeValue] = useState<string>("");

  const handleStartEdit = (
    slotId: string,
    currentDay: string,
    currentTime: string
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

  // Group slots by day for better organization
  const groupedSlots = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.day]) {
      acc[slot.day] = [];
    }
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const days = Object.keys(groupedSlots);

  return (
    <div className="space-y-8">
      {days.map((day, dayIndex) => {
        const daySlots = groupedSlots[day];
        const dayColor =
          dayIndex === 0
            ? "blue"
            : dayIndex === 1
            ? "orange"
            : dayIndex === 2
            ? "green"
            : dayIndex === 3
            ? "purple"
            : dayIndex === 4
            ? "red"
            : "gray";

        return (
          <div key={day}>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-semibold"
                style={{
                  color:
                    dayColor === "blue"
                      ? "#3b82f6"
                      : dayColor === "orange"
                      ? "#f97316"
                      : dayColor === "green"
                      ? "#10b981"
                      : dayColor === "purple"
                      ? "#8b5cf6"
                      : dayColor === "red"
                      ? "#ef4444"
                      : "#6b7280",
                }}
              >
                {day}
              </h2>
              <div className="text-sm text-gray-500">
                {daySlots.length} slot{daySlots.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {daySlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`group relative bg-gray-50 rounded-lg p-4 min-h-[200px] border-2 border-dashed border-gray-200 transition-colors ${
                    draggedStudent && draggedStudent.id ? "border-blue-300" : ""
                  }`}
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
                            onChange={(e) => setEditDayValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, slot.id)}
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Day (e.g., Saturday)"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={editTimeValue}
                            onChange={(e) => setEditTimeValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, slot.id)}
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Time (e.g., 8:30 - 10:30)"
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
                            <div className="text-sm font-semibold text-gray-700">
                              {slot.day}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleStartEdit(slot.id, slot.day, slot.time)
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
                          <div className="text-sm font-medium text-gray-500">
                            {slot.time}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div></div>
                      <div
                        className={`text-xs px-2 py-1 rounded ${
                          dayColor === "blue"
                            ? "bg-blue-100 text-blue-800"
                            : dayColor === "orange"
                            ? "bg-orange-100 text-orange-800"
                            : dayColor === "green"
                            ? "bg-green-100 text-green-800"
                            : dayColor === "purple"
                            ? "bg-purple-100 text-purple-800"
                            : dayColor === "red"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
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
                      <div className="text-center py-8 text-gray-400 text-sm">
                        Drag students here
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {days.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No timeslots created yet. Add a timeslot using the form above.
        </div>
      )}
    </div>
  );
}
