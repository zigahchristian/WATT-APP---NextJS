"use client";

import type React from "react";

import { useState } from "react";
import { StudentCard } from "./student-card";
import type { Student, TimeSlot } from "./timetable";
import { Clock } from "lucide-react";

interface TimeSlotCellProps {
  slot: TimeSlot;
  onDragStart: (student: Student, source: string) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  isDragging: boolean;
}

export function TimeSlotCell({
  slot,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging,
}: TimeSlotCellProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`min-h-35 rounded-lg border-2 border-dashed p-3 transition-all ${
        isDragOver
          ? "border-primary bg-primary/5 scale-[1.02]"
          : isDragging
          ? "border-muted-foreground/30 bg-muted/30"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{slot.time}</span>
      </div>

      <div className="space-y-1.5">
        {slot.students.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 text-center py-4">
            Drop students here
          </p>
        ) : (
          slot.students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onDragStart={() => onDragStart(student, slot.id)}
              onDragEnd={onDragEnd}
              compact
            />
          ))
        )}
      </div>
    </div>
  );
}
