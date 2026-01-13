"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeSlotCell } from "./time-slot-cell";
import type { Student, TimeSlot } from "./timetable";
import { Calendar } from "lucide-react";

interface TimetableGridProps {
  timeSlots: TimeSlot[];
  onDragStart: (student: Student, source: string) => void;
  onDragEnd: () => void;
  onDrop: (slotId: string) => void;
  draggedStudent: Student | null;
}

export function TimetableGrid({
  timeSlots,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedStudent,
}: TimetableGridProps) {
  const saturdaySlots = timeSlots.filter((slot) => slot.day === "Saturday");
  const sundaySlots = timeSlots.filter((slot) => slot.day === "Sunday");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Weekly Timetable
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Saturday */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              Saturday
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {saturdaySlots.map((slot) => (
                <TimeSlotCell
                  key={slot.id}
                  slot={slot}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDrop={() => onDrop(slot.id)}
                  isDragging={draggedStudent !== null}
                />
              ))}
            </div>
          </div>

          {/* Sunday */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              Sunday
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {sundaySlots.map((slot) => (
                <TimeSlotCell
                  key={slot.id}
                  slot={slot}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDrop={() => onDrop(slot.id)}
                  isDragging={draggedStudent !== null}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
