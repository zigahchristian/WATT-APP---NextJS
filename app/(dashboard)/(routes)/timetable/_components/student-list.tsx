"use client";

import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentCard } from "./student-card";
import type { Student } from "./timetable";
import { Users } from "lucide-react";

interface StudentListProps {
  students: Student[];
  onDragStart: (student: Student) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  isDraggingOver: boolean;
}

export function StudentList({
  students,
  onDragStart,
  onDragEnd,
  onDrop,
  isDraggingOver,
}: StudentListProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop();
  };

  return (
    <Card
      className={`h-fit transition-colors ${
        isDraggingOver ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Students ({students?.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-125 overflow-y-auto pr-1">
          {students?.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              All students assigned. Drag back here to unassign.
            </p>
          ) : (
            students?.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onDragStart={() => onDragStart(student)}
                onDragEnd={onDragEnd}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
