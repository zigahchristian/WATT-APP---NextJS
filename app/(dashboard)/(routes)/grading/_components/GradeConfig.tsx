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
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2 } from "lucide-react";
import axios from "axios";

interface GradeConfig {
  id?: string;
  subject: string;
  assignmentsWeight: number;
  quizzesWeight: number;
  projectsWeight: number;
  examsWeight: number;
  passingScore: number;
  gradingScale: Record<string, number>;
}

export function GradeConfig() {
  const [configs, setConfigs] = useState<GradeConfig[]>([]);
  const [editingConfig, setEditingConfig] = useState<GradeConfig | null>(null);
  const [newGradeLetter, setNewGradeLetter] = useState("");
  const [newMinScore, setNewMinScore] = useState("");

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await axios.get("/api/grading/config");
      setConfigs(response.data);
    } catch (error) {
      console.error("Error fetching configs:", error);
    }
  };

  const handleSaveConfig = async () => {
    if (!editingConfig) return;

    try {
      await axios.post("/api/grading/config", editingConfig);
      await fetchConfigs();
      setEditingConfig(null);
    } catch (error) {
      console.error("Error saving config:", error);
    }
  };

  const handleEditConfig = (config: GradeConfig) => {
    setEditingConfig({ ...config });
  };

  const handleAddGradeScale = () => {
    if (!editingConfig || !newGradeLetter || !newMinScore) return;

    setEditingConfig({
      ...editingConfig,
      gradingScale: {
        ...editingConfig.gradingScale,
        [newGradeLetter.toUpperCase()]: parseFloat(newMinScore),
      },
    });

    setNewGradeLetter("");
    setNewMinScore("");
  };

  const handleRemoveGradeScale = (gradeLetter: string) => {
    if (!editingConfig) return;

    const newScale = { ...editingConfig.gradingScale };
    delete newScale[gradeLetter];

    setEditingConfig({
      ...editingConfig,
      gradingScale: newScale,
    });
  };

  const totalWeight = editingConfig
    ? editingConfig.assignmentsWeight +
      editingConfig.quizzesWeight +
      editingConfig.projectsWeight +
      editingConfig.examsWeight
    : 0;

  const subjects = [
    "Pro-6-Month Professional Course",
    "Module 1 - Beginners",
    "Module 2A - Fullstack Web Developement",
    "Module 2B - Software Developement",
    "Module 3 - Networking & CyberSecurity",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grade Configuration</CardTitle>
          <CardDescription>
            Configure grading weights and scales for each subject
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {editingConfig ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={editingConfig.subject}
                        onValueChange={(value) =>
                          setEditingConfig({ ...editingConfig, subject: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Assessment Weights</h3>

                      <div className="space-y-2">
                        <Label htmlFor="assignments">Assignments Weight</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="1"
                            step="0.05"
                            value={editingConfig.assignmentsWeight}
                            onChange={(e) =>
                              setEditingConfig({
                                ...editingConfig,
                                assignmentsWeight: parseFloat(e.target.value),
                              })
                            }
                          />
                          <span className="text-sm text-gray-500">
                            (
                            {(editingConfig.assignmentsWeight * 100).toFixed(0)}
                            %)
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quizzes">Quizzes Weight</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="1"
                            step="0.05"
                            value={editingConfig.quizzesWeight}
                            onChange={(e) =>
                              setEditingConfig({
                                ...editingConfig,
                                quizzesWeight: parseFloat(e.target.value),
                              })
                            }
                          />
                          <span className="text-sm text-gray-500">
                            ({(editingConfig.quizzesWeight * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="projects">Projects Weight</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="1"
                            step="0.05"
                            value={editingConfig.projectsWeight}
                            onChange={(e) =>
                              setEditingConfig({
                                ...editingConfig,
                                projectsWeight: parseFloat(e.target.value),
                              })
                            }
                          />
                          <span className="text-sm text-gray-500">
                            ({(editingConfig.projectsWeight * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="exams">Exams Weight</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="1"
                            step="0.05"
                            value={editingConfig.examsWeight}
                            onChange={(e) =>
                              setEditingConfig({
                                ...editingConfig,
                                examsWeight: parseFloat(e.target.value),
                              })
                            }
                          />
                          <span className="text-sm text-gray-500">
                            ({(editingConfig.examsWeight * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Weight:</span>
                          <span
                            className={`text-lg font-bold ${
                              Math.abs(totalWeight - 1) < 0.01
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {(totalWeight * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {Math.abs(totalWeight - 1) < 0.01
                            ? "✓ Weights sum to 100% correctly"
                            : "✗ Weights must sum to 100% (1.0)"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editingConfig.passingScore}
                        onChange={(e) =>
                          setEditingConfig({
                            ...editingConfig,
                            passingScore: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Grading Scale</h3>

                    <div className="space-y-3">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Grade</TableHead>
                            <TableHead>Minimum Score</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(editingConfig.gradingScale)
                            .sort(([, a], [, b]) => b - a)
                            .map(([grade, minScore]) => (
                              <TableRow key={grade}>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="font-mono"
                                  >
                                    {grade}
                                  </Badge>
                                </TableCell>
                                <TableCell>{minScore}%</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveGradeScale(grade)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>

                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label htmlFor="newGrade">Grade Letter</Label>
                          <Input
                            id="newGrade"
                            value={newGradeLetter}
                            onChange={(e) => setNewGradeLetter(e.target.value)}
                            placeholder="A, B, C, etc."
                            maxLength={2}
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="newMinScore">Minimum Score</Label>
                          <Input
                            id="newMinScore"
                            type="number"
                            min="0"
                            max="100"
                            value={newMinScore}
                            onChange={(e) => setNewMinScore(e.target.value)}
                            placeholder="90"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleAddGradeScale}
                          disabled={!newGradeLetter || !newMinScore}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setEditingConfig(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveConfig}
                    disabled={Math.abs(totalWeight - 1) > 0.01}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Configuration
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Assignments</TableHead>
                      <TableHead>Quizzes</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Exams</TableHead>
                      <TableHead>Passing Score</TableHead>
                      <TableHead>Grading Scale</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configs.map((config) => (
                      <TableRow key={config.subject}>
                        <TableCell className="font-medium">
                          {config.subject}
                        </TableCell>
                        <TableCell>
                          {(config.assignmentsWeight * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell>
                          {(config.quizzesWeight * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell>
                          {(config.projectsWeight * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell>
                          {(config.examsWeight * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell>{config.passingScore}%</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(config.gradingScale)
                              .sort(([, a], [, b]) => b - a)
                              .map(([grade, minScore]) => (
                                <Badge key={grade} variant="outline">
                                  {grade}: {minScore}%
                                </Badge>
                              ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditConfig(config)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {configs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No grade configurations found.</p>
                    <Button
                      onClick={() =>
                        setEditingConfig({
                          subject: "Beginner",
                          assignmentsWeight: 0.2,
                          quizzesWeight: 0.2,
                          projectsWeight: 0.2,
                          examsWeight: 0.4,
                          passingScore: 60,
                          gradingScale: {
                            A: 90,
                            B: 80,
                            C: 70,
                            D: 60,
                            F: 0,
                          },
                        })
                      }
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Configuration
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Grading Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              To add a new subject configuration, click the "Add Configuration"
              button. Make sure the total weight of all assessment types equals
              100%.
            </p>

            <Button
              onClick={() =>
                setEditingConfig({
                  subject: "",
                  assignmentsWeight: 0.2,
                  quizzesWeight: 0.2,
                  projectsWeight: 0.2,
                  examsWeight: 0.4,
                  passingScore: 60,
                  gradingScale: {
                    A: 90,
                    B: 80,
                    C: 70,
                    D: 60,
                    F: 0,
                  },
                })
              }
              disabled={!!editingConfig}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
