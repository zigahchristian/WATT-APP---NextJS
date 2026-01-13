"use client";

import type { Student } from "./timetable";
import { GripVertical } from "lucide-react";

interface StudentCardProps {
  student: Student;
  onDragStart: () => void;
  onDragEnd: () => void;
  compact?: boolean;
}

export function StudentCard({
  student,
  onDragStart,
  onDragEnd,
  compact = false,
}: StudentCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        backgroundColor: student.bgHex,
        borderColor: student.borderHex,
        color: student.textHex,
      }}
      className={`border rounded-lg cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
        compact ? "px-2 py-1.5 text-xs" : "px-3 py-2"
      }`}
    >
      <div className="flex items-center gap-2">
        <GripVertical
          className={`opacity-50 ${compact ? "h-3 w-3" : "h-4 w-4"}`}
        />
        <div className="min-w-0 flex-1">
          <p
            className={`font-medium truncate ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {student.name}
          </p>
          {<p className="text-xs opacity-75">{student.subject}</p>}
        </div>
      </div>
    </div>
  );
}
