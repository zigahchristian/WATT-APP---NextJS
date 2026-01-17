"use client";
import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  CalendarIcon,
  Camera,
  RotateCw,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { format, setMonth, setYear } from "date-fns";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Link from "next/link";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

// Validation schema
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
  imageUrl: z.string(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;
// Generate student ID
const generateStudentId = () => {
  const prefix = "WATT";
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${randomNum}`;
};

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

// Webcam video constraints
const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

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
            <SelectTrigger className="h-8 w-30 text-xs bg-white border-gray-300">
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
            <SelectTrigger className="h-8 w-22.5 text-xs bg-white border-gray-300">
              <SelectValue>{currentDate.getFullYear()}</SelectValue>
            </SelectTrigger>
            <SelectContent className="h-50 bg-white border-gray-200">
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

const AddStudentForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const webcamRef = useRef<Webcam>(null);
  const router = useRouter();
  const form = useForm<StudentFormValues>({
    defaultValues: {
      studentId: generateStudentId(),
    },
    mode: "onChange",
  });

  // Capture photo from webcam
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImages((prev) => [...prev, imageSrc]);
        toast.success("Image captured successfully");
      }
    }
  }, [webcamRef]);

  // Use a captured image
  const useCapturedImage = (image: string) => {
    setPreviewImage(image);
    form.setValue("imageUrl", image);
    setIsCameraOpen(false);
    setCapturedImages([]);
    toast.success("Image Uploaded successfully");
  };

  // Remove a captured image
  const removeCapturedImage = (index: number) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Switch camera (front/back)
  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Reset camera capture
  const resetCamera = () => {
    setCapturedImages([]);
  };

  async function onSubmit(data: StudentFormValues) {
    setIsLoading(true);

    try {
      await axios.post("/api/students", data);
      router.push("/students");
      toast.success("Student registered successfully!");

      // Reset form
      form.reset();
      setPreviewImage(null);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-3xl font-bold tracking-tight">
              Add New Student
            </h1>
            <p className="text-muted-foreground">
              Register a new student by filling out all required information
              below.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="mt-2">
          <span className="font-medium">Auto-generated ID:</span>{" "}
          {generateStudentId()}
        </Badge>
      </div>

      <Card className="shadow-lg border-gray-200">
        <CardHeader className="bg-linear-to-r from-primary/5 to-primary/10 border-b">
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6" />
            Student Registration Form
          </CardTitle>
          <p className="text-muted-foreground">
            All fields marked with{" "}
            <span className="text-destructive font-bold">*</span> are required.
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
                    <div className="lg:w-1/3">
                      <div className="space-y-4">
                        <div className="flex flex-col items-center">
                          <div className="relative group">
                            <Avatar className="h-40 w-40 border-4 border-white shadow-lg">
                              {previewImage ? (
                                <AvatarImage
                                  src={previewImage}
                                  alt="Student photo"
                                  className="object-cover"
                                />
                              ) : (
                                <AvatarFallback className="text-3xl bg-linear-to-br from-primary/20 to-primary/10">
                                  <Camera className="h-10 w-10 text-primary/70" />
                                </AvatarFallback>
                              )}
                            </Avatar>
                            {previewImage && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-lg"
                                onClick={() => {
                                  setPreviewImage(null);
                                  form.setValue("imageUrl", "");
                                }}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>

                          <div className="mt-4 space-y-3 w-full max-w-xs">
                            <Dialog
                              open={isCameraOpen}
                              onOpenChange={setIsCameraOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  type="button"
                                  className="w-full shadow-sm bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
                                  variant="outline"
                                >
                                  <Camera className="mr-2 h-4 w-4" />
                                  Take Photo with Camera
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-175 bg-white">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Camera className="h-5 w-5" />
                                    Capture Student Photo
                                  </DialogTitle>
                                  <DialogDescription>
                                    Position the studFent in good lighting and
                                    click the capture button. You can take
                                    multiple photos and choose the best one.
                                  </DialogDescription>
                                </DialogHeader>

                                <Tabs defaultValue="camera" className="w-full">
                                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                                    <TabsTrigger
                                      value="camera"
                                      className="data-[state=active]:bg-white"
                                    >
                                      <Camera className="h-4 w-4 mr-2" />
                                      Camera
                                    </TabsTrigger>
                                    <TabsTrigger
                                      value="gallery"
                                      className="data-[state=active]:bg-white"
                                    >
                                      <div className="h-4 w-4 mr-2 bg-linear-to-r from-blue-400 to-purple-400 rounded" />
                                      Gallery
                                    </TabsTrigger>
                                  </TabsList>

                                  <TabsContent
                                    value="camera"
                                    className="space-y-4 pt-4"
                                  >
                                    <div className="relative rounded-xl overflow-hidden bg-black border-4 border-gray-800">
                                      <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{
                                          ...videoConstraints,
                                          facingMode,
                                        }}
                                        className="w-full h-auto"
                                      />
                                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="secondary"
                                          onClick={switchCamera}
                                          title="Switch camera"
                                          className="rounded-full bg-white/90 hover:bg-white shadow-lg"
                                        >
                                          <RotateCw className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          size="icon"
                                          onClick={capturePhoto}
                                          title="Capture photo"
                                          className="h-14 w-14 rounded-full bg-white hover:bg-white shadow-lg"
                                        >
                                          <div className="h-12 w-12 rounded-full border-4 border-red-500 bg-red-500/20" />
                                        </Button>
                                      </div>
                                    </div>

                                    {capturedImages.length > 0 && (
                                      <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-semibold">
                                              Captured Photos
                                            </h4>
                                            <Badge
                                              variant="secondary"
                                              className="px-2"
                                            >
                                              {capturedImages.length}
                                            </Badge>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={resetCamera}
                                            className="text-xs"
                                          >
                                            Clear All
                                          </Button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                          {capturedImages.map(
                                            (image, index) => (
                                              <div
                                                key={index}
                                                className="relative group rounded-lg overflow-hidden border"
                                              >
                                                <img
                                                  src={image}
                                                  alt={`Captured ${index + 1}`}
                                                  className="w-full h-28 object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                                                  <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() =>
                                                      // eslint-disable-next-line react-hooks/rules-of-hooks
                                                      useCapturedImage(image)
                                                    }
                                                    className="h-8 bg-white hover:bg-white/90 text-black"
                                                  >
                                                    Use This
                                                  </Button>
                                                  <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="destructive"
                                                    onClick={() =>
                                                      removeCapturedImage(index)
                                                    }
                                                    className="h-8 w-8"
                                                  >
                                                    <X className="h-3.5 w-3.5" />
                                                  </Button>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </TabsContent>

                                  <TabsContent
                                    value="gallery"
                                    className="space-y-4 pt-4"
                                  >
                                    {capturedImages.length === 0 ? (
                                      <div className="text-center py-10 bg-gray-50 rounded-lg">
                                        <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-500 mb-2">
                                          No photos captured yet
                                        </p>
                                        <p className="text-sm text-gray-400">
                                          Switch to Camera tab to take photos
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-3 gap-3">
                                        {capturedImages.map((image, index) => (
                                          <div
                                            key={index}
                                            className="relative group rounded-lg overflow-hidden border"
                                          >
                                            <img
                                              src={image}
                                              alt={`Captured ${index + 1}`}
                                              className="w-full h-32 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                                              <Button
                                                type="button"
                                                size="sm"
                                                onClick={() =>
                                                  // eslint-disable-next-line react-hooks/rules-of-hooks
                                                  useCapturedImage(image)
                                                }
                                                className="h-8 bg-white hover:bg-white/90 text-black"
                                              >
                                                Select
                                              </Button>
                                              <Button
                                                type="button"
                                                size="icon"
                                                variant="destructive"
                                                onClick={() =>
                                                  removeCapturedImage(index)
                                                }
                                                className="h-8 w-8"
                                              >
                                                <X className="h-3.5 w-3.5" />
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </TabsContent>
                                </Tabs>

                                <DialogFooter>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setIsCameraOpen(false);
                                      setCapturedImages([]);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      if (capturedImages.length > 0) {
                                        // eslint-disable-next-line react-hooks/rules-of-hooks
                                        useCapturedImage(
                                          capturedImages[
                                            capturedImages.length - 1
                                          ]
                                        );
                                      } else {
                                        setIsCameraOpen(false);
                                      }
                                    }}
                                    disabled={capturedImages.length === 0}
                                  >
                                    Use Latest Photo
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <div className="text-xs text-center text-gray-500 pt-2">
                              <div className="flex items-center justify-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Clear face photo required for ID
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Basic Info Form */}
                    <div className="lg:w-2/3">
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

                      {/* Gender and DOB */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                                defaultValue={field.value}
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
                        <Input
                          placeholder="123 Main Street, City, State"
                          {...field}
                          className="bg-white border-gray-300 focus:border-primary"
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
                          defaultValue={field.value}
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

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>Please review all information before submitting</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/students/">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isLoading}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Adding Student...
                      </>
                    ) : (
                      "Register Student"
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
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          All student information is securely stored. You can update student
          details at any time from the student management dashboard. Contact
          support for assistance.
        </p>
      </div>
    </div>
  );
};

export default AddStudentForm;
