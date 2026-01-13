"use client";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CalendarIcon,
  User,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { format, setMonth, setYear } from "date-fns";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import axios from "axios";

// Validation schema (same as add form)
const studentFormSchema = z.object({
  studentId: z.string(),
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  status: z.string().default("ACTIVE"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {}),
  dob: z.date({}),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  course: z.string({}),
  enrollmentdate: z.date({}),
  emergencyContactName: z.string().min(2, {
    message: "Emergency contact name must be at least 2 characters.",
  }),
  emergencyContactPhone: z.string().min(10, {
    message: "Emergency contact phone must be at least 10 digits.",
  }),
  imageUrl: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

// Course options
const courses = [
  "Pro-6-Month Professional Course",
  "Module 1 - Beginners",
  "Module 2A - Fullstack Web Developement",
  "Module 2B - Software Developement",
  "Module 3 - Networking & CyberSecurity",
];

// Gender options
const genders = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

// Status options
const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "GRADUATED", label: "Graduated" },
  { value: "SUSPENDED", label: "Suspended" },
];

// Month names
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Generate years (from 1900 to current year)
const currentYear = new Date().getFullYear();
const years = Array.from(
  { length: currentYear - 1899 },
  (_, i) => currentYear - i
);

// Enhanced Calendar Component with Year/Month Selection
interface EnhancedCalendarProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  fromYear?: number;
  toYear?: number;
  className?: string;
}

const EnhancedCalendar = ({
  selected,
  onSelect,
  disabled,

  className,
}: EnhancedCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(selected || new Date());

  const handleYearChange = (year: number) => {
    const newDate = setYear(currentDate, year);
    setCurrentDate(newDate);
  };

  const handleMonthChange = (month: number) => {
    const newDate = setMonth(currentDate, month);
    setCurrentDate(newDate);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    setCurrentDate(newDate);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        {/* Month Selector */}
        <div className="flex items-center space-x-2">
          <Select
            value={currentDate.getMonth().toString()}
            onValueChange={(value) => handleMonthChange(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[120px] text-xs bg-white border-gray-300">
              <SelectValue>{months[currentDate.getMonth()]}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              {months.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Selector */}
        <div className="flex items-center space-x-2">
          <Select
            value={currentDate.getFullYear().toString()}
            onValueChange={(value) => handleYearChange(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[90px] text-xs bg-white border-gray-300">
              <SelectValue>{currentDate.getFullYear()}</SelectValue>
            </SelectTrigger>
            <SelectContent className="h-[200px] bg-white border-gray-200">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={currentDate}
        onMonthChange={setCurrentDate}
        disabled={disabled}
        initialFocus
        className="p-3"
      />
    </div>
  );
};

// Helper function to safely format dates
const safeFormatDate = (
  dateString: string | Date | null | undefined,
  formatString: string = "PPP"
): string => {
  if (!dateString) return "N/A";

  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "N/A";
    }

    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "N/A";
  }
};

// Helper function to safely parse dates
const safeParseDate = (
  dateString: string | Date | null | undefined
): Date | undefined => {
  if (!dateString) return undefined;

  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return undefined;
    }

    return date;
  } catch (error) {
    console.error("Error parsing date:", dateString, error);
    return undefined;
  }
};

interface EditStudentFormProps {
  studentId: string;
}

const EditStudentForm = ({ studentId }: EditStudentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [studentData, setStudentData] = useState<StudentFormValues | null>(
    null
  );

  const webcamRef = useRef<Webcam>(null);
  const router = useRouter();

  const form = useForm<StudentFormValues>({
    defaultValues: {
      studentId: studentData?.studentId,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      status: "ACTIVE",
      gender: undefined,
      dob: undefined,
      address: "",
      course: "",
      enrollmentdate: undefined,
      emergencyContactName: "",
      emergencyContactPhone: "",
      imageUrl: "",
      createdAt: undefined,
      updatedAt: undefined,
    },
  });

  // Fetch student data on component mount
  useEffect(() => {
    const fetchStudentData = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get(`/api/students/${studentId}`);
        const data = response.data;

        setStudentData(data);

        // Safely parse dates
        const dobDate = safeParseDate(data.dob);
        const enrollmentDate = safeParseDate(data.enrollmentdate);

        // Reset form with fetched data
        form.reset({
          studentId: data.studentId,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          status: data.status || "ACTIVE",
          gender: data.gender,
          dob: dobDate,
          address: data.address || "",
          course: data.course || "",
          enrollmentdate: enrollmentDate,
          emergencyContactName: data.emergencyContactName || "",
          emergencyContactPhone: data.emergencyContactPhone || "",
          imageUrl: data.imageUrl || "",
        });

        toast.success("Student data loaded successfully");
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast.error("Failed to load student data");
        router.push("/students");
      } finally {
        setIsFetching(false);
      }
    };

    if (studentId) {
      fetchStudentData();
    }
  }, [studentId, form, router]);

  async function onSubmit(data: StudentFormValues) {
    setIsLoading(true);

    try {
      await axios.put(`/api/students/${studentId}`, data);
      toast.success("Student updated successfully!");

      // Refresh the page to show updated data
      router.push("/students");
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCancel = () => {
    router.push("/students");
  };

  if (isFetching || !studentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/students")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Student</h1>
            <p className="text-muted-foreground">
              Update student information below. All fields marked with{" "}
              <span className="text-destructive font-bold">*</span> are
              required.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Badge variant="outline" className="text-base px-4 py-2">
            <span className="font-medium">Student ID:</span>{" "}
            {studentData?.studentId}
          </Badge>
          <Badge
            variant={
              studentData?.status === "ACTIVE"
                ? "default"
                : studentData?.status === "GRADUATED"
                ? "secondary"
                : "destructive"
            }
            className="px-4 py-2"
          >
            {studentData?.status}
          </Badge>
          <div className="text-sm text-gray-500">
            Last updated: {safeFormatDate(studentData?.updatedAt)}
          </div>
        </div>
      </div>

      <Card className="shadow-lg border-gray-200">
        <CardHeader className="bg-linear-to-r from-primary/5 to-primary/10 border-b">
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6" />
            Edit Student Information
          </CardTitle>
          <p className="text-muted-foreground">
            Make changes to the student&apos;s profile and save to update.
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    Personal Information
                  </h3>

                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Profile Picture Section */}

                    {/* Basic Info Form */}
                    <div className="lg:w-3/3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                First Name{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="John"
                                  {...field}
                                  className="bg-white border-gray-300 focus:border-primary"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                Last Name{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Doe"
                                  {...field}
                                  className="bg-white border-gray-300 focus:border-primary"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5" />
                                Email{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="john.doe@example.com"
                                  type="email"
                                  {...field}
                                  className="bg-white border-gray-300 focus:border-primary"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5" />
                                Phone{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="+1234567890"
                                  {...field}
                                  className="bg-white border-gray-300 focus:border-primary"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Gender, DOB, and Status */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                Gender{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-white border-gray-300 focus:ring-primary">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white border-gray-200">
                                  {genders.map((gender) => (
                                    <SelectItem
                                      key={gender.value}
                                      value={gender.value}
                                    >
                                      {gender.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dob"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="flex items-center gap-1.5">
                                <CalendarIcon className="h-3.5 w-3.5" />
                                Date of Birth{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className="w-full pl-3 text-left font-normal bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span className="text-gray-500">
                                          Pick a date
                                        </span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-70" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0 bg-white border-gray-200 shadow-lg"
                                  align="start"
                                >
                                  <EnhancedCalendar
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() ||
                                      date < new Date("1900-01-01")
                                    }
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1.5">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Status
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-white border-gray-300 focus:ring-primary">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white border-gray-200">
                                  {statusOptions.map((status) => (
                                    <SelectItem
                                      key={status.value}
                                      value={status.value}
                                    >
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Address Information */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-100">
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>
                  Address Information
                </h3>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        Street Address{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="123 Main Street, City, State, ZIP Code"
                          {...field}
                          className="bg-white border-gray-300 focus:border-primary min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="my-6" />

              {/* Course Information */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-green-100">
                    <BookOpen className="h-4 w-4 text-green-600" />
                  </div>
                  Course Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="course"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" />
                          Course <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white border-gray-300 focus:ring-primary">
                              <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border-gray-200">
                            {courses.map((course) => (
                              <SelectItem key={course} value={course}>
                                {course}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enrollmentdate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          Enrollment Date{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span className="text-gray-500">
                                    Pick a date
                                  </span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-70" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 bg-white border-gray-200 shadow-lg"
                            align="start"
                          >
                            <EnhancedCalendar
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date("2020-01-01")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="my-6" />

              {/* Emergency Contact */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-red-100">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          Contact Name{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Jane Doe"
                            {...field}
                            className="bg-white border-gray-300 focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          Contact Phone{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1234567890"
                            {...field}
                            className="bg-white border-gray-300 focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="my-6" />

              {/* Additional Information */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-100">
                    <AlertCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Created At</Label>
                    <div className="text-sm text-gray-600 bg-white border border-gray-300 rounded-md p-2">
                      {safeFormatDate(studentData?.createdAt, "PPP p")}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <div className="text-sm text-gray-600 bg-white border border-gray-300 rounded-md p-2">
                      {safeFormatDate(studentData?.updatedAt, "PPP p")}
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>Review all changes before saving</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Safely parse dates for reset
                      const dobDate = safeParseDate(studentData?.dob);
                      const enrollmentDate = safeParseDate(
                        studentData?.enrollmentdate
                      );

                      form.reset({
                        firstName: studentData?.firstName || "",
                        lastName: studentData?.lastName || "",
                        email: studentData?.email || "",
                        phone: studentData?.phone || "",
                        status: studentData?.status || "ACTIVE",
                        gender: studentData?.gender,
                        dob: dobDate,
                        address: studentData?.address || "",
                        course: studentData?.course || "",
                        enrollmentdate: enrollmentDate,
                        emergencyContactName:
                          studentData?.emergencyContactName || "",
                        emergencyContactPhone:
                          studentData?.emergencyContactPhone || "",
                        imageUrl: studentData?.imageUrl || "",
                      });

                      toast.success("Form reset to original values");
                    }}
                    disabled={isLoading}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Reset Changes
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving Changes...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="mt-6 text-sm text-gray-500 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          All student information will be updated immediately. Changes to
          enrollment date or status may affect billing and access. Contact
          support for assistance with complex changes.
        </p>
      </div>
    </div>
  );
};

export default EditStudentForm;
