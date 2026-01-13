"use client";
import * as React from "react";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus } from "lucide-react";
import { StudentStatsCards } from "../../_components/StatCards";

import { StudentStatsChart } from "../../_components/StudentChart";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  enrollmentdate: string; // Note: lowercase 'd' in your data
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  imageUrl: string;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED";
  createdAt?: string;
  updatedAt?: string;
};

export type Student = {
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
  enrollmentDate: string;
  imageUrl: string;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED";
  createdAt?: string;
  updatedAt?: string;
};

export const columns: ColumnDef<Student>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
            ? "indeterminate"
            : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "bioInfo",
    header: "Bio Info",
    cell: ({ row }) => {
      const student = row.original;
      // Fix image URL - prepend /uploads/ if it's a relative path
      const imageSrc = student.imageUrl.startsWith("http")
        ? student.imageUrl
        : `${student.imageUrl}`;

      return (
        <div className="flex items-center space-x-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden">
            <div className="relative group">
              <Avatar className="h-10 w-10 border-4 border-background shadow-xl">
                <AvatarImage
                  src={student.imageUrl}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl bg-primary/20">
                  {student.firstName?.[0]}
                  {student.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div>
            <div className="font-medium">
              {student.firstName} {student.lastName}
            </div>
            <div className={`text-sm ${getStatusColor(student.status)}`}>
              {student.status}
            </div>
            <div className="text-xs text-gray-500">{student.studentId}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "course",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Course
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("course")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div>{row.getValue("phone")}</div>,
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      const gender = row.getValue("gender") as string;
      return <div className="capitalize">{gender.toLowerCase()}</div>;
    },
  },
  {
    accessorKey: "enrollmentDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Enrollment Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      try {
        const dateValue = row.getValue("enrollmentDate") as string;
        const date = new Date(dateValue);

        // Check if date is valid
        if (isNaN(date.getTime())) {
          return <div className="text-red-500 text-sm">Invalid date</div>;
        }

        return (
          <div>
            {date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        );
      } catch (error) {
        return <div className="text-red-500 text-sm">Date error</div>;
      }
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const student = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(student.id)}
            >
              Copy student ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(student.studentId)}
            >
              Copy student number
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/students/${student.id}`}>View student details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/students/edit/${student.id}`}>
                Edit student info
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Helper function for status colors
function getStatusColor(status: Student["status"]): string {
  switch (status) {
    case "ACTIVE":
      return "text-green-600";
    case "INACTIVE":
      return "text-yellow-600";
    case "GRADUATED":
      return "text-blue-600";
    default:
      return "text-gray-500";
  }
}

// Helper function to format image URL
function formatImageUrl(imageUrl: string): string {
  if (!imageUrl) return "/default-avatar.png";

  // If it's already a full URL or starts with /, return as is
  if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
    return imageUrl;
  }

  // If it's a relative path like "avatars/filename.jpg", prepend /uploads/
  return `${imageUrl}`;
}

// Helper function to transform raw API data to Student type
function transformStudentData(rawData: RawStudent[]): Student[] {
  return rawData.map((student) => ({
    ...student,
    // Map enrollmentdate to enrollmentDate
    enrollmentDate: student.enrollmentdate || "",
    // Format image URL
    imageUrl: formatImageUrl(student.imageUrl),
  }));
}

interface DataTableProps {
  initialData?: Student[];
}

const DataTable: React.FC<DataTableProps> = ({ initialData = [] }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState<Student[]>(initialData);
  const [isLoading, setIsLoading] = React.useState(!initialData.length);

  // Fetch data if no initialData provided
  React.useEffect(() => {
    if (initialData.length === 0) {
      fetchStudents();
    }
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/students");
      const rawStudents: RawStudent[] = response.data;

      // Transform the data to match our Student type
      const transformedStudents = transformStudentData(rawStudents);

      setData(transformedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="p-6">
        <StudentStatsCards />
        <div className="m-6" />
        <StudentStatsChart />
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter emails..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Filter by name or ID..."
            value={
              (table.getColumn("bioInfo")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) => {
              // Simple global search across multiple fields
              const searchValue = event.target.value.toLowerCase();
              if (searchValue === "") {
                // Reset filtering if empty
                table.setGlobalFilter(undefined);
              } else {
                table.setGlobalFilter(searchValue);
              }
            }}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/students/create">
            <Button variant="default" size="sm">
              <Plus /> Add Student
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={fetchStudents}>
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "bioInfo" ? "Bio Info" : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
