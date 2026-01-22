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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2, Edit2 } from "lucide-react";
import axios from "axios";

interface AttendanceConfig {
  id?: string;
  subject?: string; // ✅ must be optional (Radix-safe)
  dayOfWeek?: string; // ✅ must be optional (Radix-safe)
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export function AttendanceConfig() {
  const [configs, setConfigs] = useState<AttendanceConfig[]>([]);
  const [editingConfig, setEditingConfig] = useState<AttendanceConfig | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await axios.get("/api/attendance/config");
      setConfigs(res.data);
    } catch (err) {
      console.error("Error fetching configs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!editingConfig) return;

    try {
      await axios.post("/api/attendance/config", editingConfig);
      await fetchConfigs();
      setEditingConfig(null);
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert("Configuration already exists for this subject and day.");
      } else {
        console.error("Error saving config:", err);
      }
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm("Are you sure you want to delete this configuration?")) return;

    try {
      await axios.delete(`/api/attendance/config?id=${id}`);
      await fetchConfigs();
    } catch (err) {
      console.error("Error deleting config:", err);
    }
  };

  const handleToggleActive = async (config: AttendanceConfig) => {
    try {
      await axios.post("/api/attendance/config", {
        ...config,
        isActive: !config.isActive,
      });
      await fetchConfigs();
    } catch (err) {
      console.error("Error toggling config:", err);
    }
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const subjects = [
    "VMware & Windows OS",
    "VMware & Linux OS",
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "Web Design",
    "Web Development",
    "Full Stack Web Developement",
    "Artificial Intelligence",
    "Python Programing Language",
    "C Programing Language",
    "Mavis Beacon Teaches Typing",
    "Networking",
    "Cybersecurity",
    "Windows OS Fundamentals",
    "Introduction to AI",
    "Accessing the Internet",
  ];

  const getDayColor = (day?: string) => {
    const colors: Record<string, string> = {
      Monday: "bg-blue-100 text-blue-800",
      Tuesday: "bg-purple-100 text-purple-800",
      Wednesday: "bg-green-100 text-green-800",
      Thursday: "bg-yellow-100 text-yellow-800",
      Friday: "bg-red-100 text-red-800",
      Saturday: "bg-pink-100 text-pink-800",
      Sunday: "bg-indigo-100 text-indigo-800",
    };
    return colors[day ?? ""] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <p className="text-center py-8">Loading configurations...</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Schedule Configuration</CardTitle>
          <CardDescription>
            Configure class schedules for attendance tracking
          </CardDescription>
        </CardHeader>

        <CardContent>
          {editingConfig ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SUBJECT */}
              <div>
                <Label>Subject *</Label>
                <Select
                  value={editingConfig.subject ?? undefined}
                  onValueChange={(value) =>
                    setEditingConfig({ ...editingConfig, subject: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
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

              {/* DAY */}
              <div>
                <Label>Day of Week *</Label>
                <Select
                  value={editingConfig.dayOfWeek ?? undefined}
                  onValueChange={(value) =>
                    setEditingConfig({ ...editingConfig, dayOfWeek: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* TIME */}
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={editingConfig.startTime}
                  onChange={(e) =>
                    setEditingConfig({
                      ...editingConfig,
                      startTime: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={editingConfig.endTime}
                  onChange={(e) =>
                    setEditingConfig({
                      ...editingConfig,
                      endTime: e.target.value,
                    })
                  }
                />
              </div>

              {/* ACTIVE */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingConfig.isActive}
                  onCheckedChange={(checked) =>
                    setEditingConfig({
                      ...editingConfig,
                      isActive: checked,
                    })
                  }
                />
                <Label>Active</Label>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 col-span-full">
                <Button
                  variant="outline"
                  onClick={() => setEditingConfig(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveConfig}
                  disabled={
                    !editingConfig.subject ||
                    !editingConfig.dayOfWeek ||
                    !editingConfig.startTime ||
                    !editingConfig.endTime
                  }
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() =>
                setEditingConfig({
                  subject: undefined,
                  dayOfWeek: undefined,
                  startTime: "09:00",
                  endTime: "10:00",
                  isActive: true,
                })
              }
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Schedule
            </Button>
          )}
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.subject}</TableCell>
                  <TableCell>
                    <Badge className={getDayColor(c.dayOfWeek)}>
                      {c.dayOfWeek}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {c.startTime} – {c.endTime}
                  </TableCell>
                  <TableCell>{c.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingConfig(c)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(c)}
                    >
                      <Switch checked={c.isActive} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => c.id && handleDeleteConfig(c.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
