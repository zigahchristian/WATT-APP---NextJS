"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import Webcam from "react-webcam";
import {
  User,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Calendar,
  ShieldAlert,
  Clock,
  Edit,
  ArrowLeft,
  GraduationCap,
  Copy,
  Cake,
  PhoneCall,
  Home,
  IdCard,
  AlertCircle,
  Camera,
  RotateCw,
  Upload,
  Check,
  X,
  Video,
  VideoOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import toast from "react-hot-toast";

// Helper function to safely format dates
const safeFormatDate = (
  dateString: string | Date | null | undefined,
  formatString: string = "PPP"
): string => {
  if (!dateString) return "N/A";

  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, formatString);
  } catch {
    return "N/A";
  }
};

// Status badges configuration
const statusConfig = {
  ACTIVE: {
    variant: "default",
    label: "Active",
    color: "bg-green-100 text-green-800",
  },
  INACTIVE: {
    variant: "secondary",
    label: "Inactive",
    color: "bg-gray-100 text-gray-800",
  },
  GRADUATED: {
    variant: "success",
    label: "Graduated",
    color: "bg-blue-100 text-blue-800",
  },
  SUSPENDED: {
    variant: "destructive",
    label: "Suspended",
    color: "bg-red-100 text-red-800",
  },
};

// Gender labels
const genderLabels = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

interface ViewStudentPageProps {
  studentId: string;
}

const ViewStudentPage = ({ studentId }: ViewStudentPageProps) => {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cameraMode, setCameraMode] = useState<"photo" | "video">("photo");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [mirrored, setMirrored] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isWebcamOn, setIsWebcamOn] = useState(true);

  const webcamRef = useRef<Webcam>(null);
  const router = useRouter();

  // Fetch student data
  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/students/${studentId}`);
      setStudent(response.data);
      if (response.data.imageUrl) {
        setImagePreview(response.data.imageUrl);
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      toast.error("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  // Capture photo from webcam
  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      toast.success("Photo captured!");
    }
  };

  // Flip camera
  const flipCamera = () => {
    setFacingMode(facingMode === "user" ? "environment" : "user");
  };

  // Toggle mirror mode
  const toggleMirror = () => {
    setMirrored(!mirrored);
  };

  // Upload captured/selected image
  const uploadProfileImage = async (imageData: string) => {
    if (!imageData) return;

    setUploading(true);
    try {
      // Convert base64 to blob
      const imgUploadData = {
        data: imageData,
      };

      await axios.put(`/api/students/${studentId}/upload`, imgUploadData);

      toast.success("Profile image updated successfully!");
      setIsCameraOpen(false);
      setCapturedImage(null);
      router.push("/students");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const imageData = reader.result as string;
      await uploadProfileImage(imageData);
    };

    reader.readAsDataURL(file);
  };

  // Handle captured image upload
  const handleCaptureUpload = async () => {
    if (capturedImage) {
      await uploadProfileImage(capturedImage);
    }
  };

  // Reset camera capture
  const resetCapture = () => {
    setCapturedImage(null);
  };

  // Toggle webcam on/off
  const toggleWebcam = () => {
    setIsWebcamOn(!isWebcamOn);
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-[600px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Student not found. Please check the student ID and try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/students")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/students")}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Student Profile
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Complete student information and details
            </p>
          </div>
        </div>
        <Button
          variant="default"
          onClick={() => router.push(`/students/edit/${studentId}`)}
          className="gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Main Profile Card */}
      <Card className="overflow-hidden border shadow-lg">
        {/* Profile Header with Background */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar Section with Webcam Button */}
            <div className="relative group">
              <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
                <AvatarImage
                  src={imagePreview || student.imageUrl}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl bg-primary/20">
                  {student.firstName?.[0]}
                  {student.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Student Info Header */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">
                    {student.firstName} {student.lastName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge
                      className={`px-3 py-1 ${
                        statusConfig[
                          student.status as keyof typeof statusConfig
                        ]?.color
                      }`}
                    >
                      {
                        statusConfig[
                          student.status as keyof typeof statusConfig
                        ]?.label
                      }
                    </Badge>
                    <Badge variant="outline" className="font-normal gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {student.course}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            {/** Update Button */}
            <div className="flex items-center justify-center">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setIsCameraOpen(true)}
                className="h-10 w-10 rounded-full shadow-lg bg-white hover:bg-white/90 border"
              >
                <Camera className="h-5 w-5" />
              </Button>
              <h3 className="text-xs p-2">Change Image</h3>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-8">
          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Personal Information</h3>
            </div>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student ID */}
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <IdCard className="h-4 w-4" />
                  Student ID
                </Label>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold">{student.studentId}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      copyToClipboard(student.studentId, "Student ID copied!")
                    }
                    className="h-8 w-8"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Gender</Label>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold">
                    {genderLabels[
                      student.gender as keyof typeof genderLabels
                    ] || student.gender}
                  </p>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Cake className="h-4 w-4" />
                  Date of Birth
                </Label>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold">
                    {safeFormatDate(student.dob, "MMMM dd, yyyy")}
                    {student.dob && (
                      <span className="text-muted-foreground text-sm ml-2">
                        (
                        {Math.floor(
                          (new Date().getTime() -
                            new Date(student.dob).getTime()) /
                            (1000 * 60 * 60 * 24 * 365.25)
                        )}{" "}
                        years)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Age (Calculated) */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Age</Label>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold">
                    {student.dob
                      ? Math.floor(
                          (new Date().getTime() -
                            new Date(student.dob).getTime()) /
                            (1000 * 60 * 60 * 24 * 365.25)
                        )
                      : "N/A"}{" "}
                    years
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Contact Information</h3>
            </div>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <p className="font-semibold truncate">{student.email}</p>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(student.email, "Email copied!")
                      }
                      className="h-8 w-8"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <PhoneCall className="h-4 w-4" />
                  Phone Number
                </Label>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <p className="font-semibold">{student.phone}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      copyToClipboard(student.phone, "Phone number copied!")
                    }
                    className="h-8 w-8"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Academic Information</h3>
            </div>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Course Enrolled</Label>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    {student.course}
                  </p>
                </div>
              </div>

              {/* Enrollment Date */}
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Enrollment Date
                </Label>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold">
                    {safeFormatDate(student.enrollmentdate)}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Academic Status</Label>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <Badge
                    className={`px-3 py-1 ${
                      statusConfig[student.status as keyof typeof statusConfig]
                        ?.color
                    }`}
                  >
                    {
                      statusConfig[student.status as keyof typeof statusConfig]
                        ?.label
                    }
                  </Badge>
                </div>
              </div>

              {/* Enrolled Since */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Enrolled Since</Label>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold">
                    {safeFormatDate(student.enrollmentdate, "MMM yyyy")}
                    <span className="text-muted-foreground text-sm ml-2">
                      (
                      {student.enrollmentdate
                        ? Math.floor(
                            (new Date().getTime() -
                              new Date(student.enrollmentdate).getTime()) /
                              (1000 * 60 * 60 * 24 * 30)
                          )
                        : "N/A"}{" "}
                      months)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address & Emergency Contact Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">
                Address & Emergency Contact
              </h3>
            </div>
            <Separator />

            <div className="grid grid-cols-1 gap-6">
              {/* Address */}
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Complete Address
                </Label>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold whitespace-pre-line leading-relaxed">
                    {student.address || "No address provided"}
                  </p>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Emergency Contact Name
                  </Label>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="font-semibold">
                      {student.emergencyContactName}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Emergency Contact Phone
                  </Label>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <p className="font-semibold">
                      {student.emergencyContactPhone}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(
                          student.emergencyContactPhone,
                          "Emergency contact copied!"
                        )
                      }
                      className="h-8 w-8"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">System Information</h3>
            </div>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Created At */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Created On</Label>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold">
                    {safeFormatDate(student.createdAt)}
                  </p>
                </div>
              </div>

              {/* Last Updated */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Last Updated</Label>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-semibold">
                    {safeFormatDate(student.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera Dialog for Profile Picture */}
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Capture a new photo or upload an image for {student.firstName}{" "}
              {student.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tabs for Camera/Upload */}
            <Tabs defaultValue="camera" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="camera" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Camera
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
              </TabsList>

              {/* Camera Tab */}
              <TabsContent value="camera" className="space-y-4">
                {capturedImage ? (
                  // Preview captured image
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={resetCapture}
                        disabled={uploading}
                        className="gap-2"
                      >
                        <RotateCw className="h-4 w-4" />
                        Retake
                      </Button>
                      <Button
                        onClick={handleCaptureUpload}
                        disabled={uploading}
                        className="gap-2"
                      >
                        {uploading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Use This Photo
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Live Camera View
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      {isWebcamOn ? (
                        <Webcam
                          ref={webcamRef}
                          audio={false}
                          screenshotFormat="image/jpeg"
                          videoConstraints={{
                            facingMode,
                            aspectRatio: 1,
                          }}
                          mirrored={mirrored}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <VideoOff className="h-12 w-12 text-gray-400" />
                        </div>
                      )}

                      {/* Camera Controls Overlay */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={toggleWebcam}
                          className="bg-white/90 hover:bg-white"
                        >
                          {isWebcamOn ? (
                            <VideoOff className="h-4 w-4" />
                          ) : (
                            <Video className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={flipCamera}
                          className="bg-white/90 hover:bg-white"
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={toggleMirror}
                          className="bg-white/90 hover:bg-white"
                        >
                          <div className="text-sm font-semibold">
                            {mirrored ? "M" : "NM"}
                          </div>
                        </Button>
                      </div>
                    </div>

                    {/* Zoom Control */}
                    <div className="space-y-2">
                      <Label className="flex justify-between">
                        <span>Zoom</span>
                        <span className="text-muted-foreground">
                          {zoom.toFixed(1)}x
                        </span>
                      </Label>
                      <Slider
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.1}
                        onValueChange={(value) => setZoom(value[0])}
                      />
                    </div>

                    {/* Capture Button */}
                    <div className="flex justify-center">
                      <Button
                        onClick={capturePhoto}
                        disabled={!isWebcamOn}
                        size="lg"
                        className="h-16 w-16 rounded-full"
                      >
                        <Camera className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Upload Tab */}
              <TabsContent value="upload" className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-40 w-40 border-4">
                    <AvatarImage
                      src={imagePreview || student.imageUrl}
                      alt="Current Profile"
                    />
                    <AvatarFallback className="text-3xl">
                      {student.firstName?.[0]}
                      {student.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="w-full">
                    <Label htmlFor="file-upload" className="sr-only">
                      Upload Image
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      JPG, PNG, WebP • Max 5MB
                    </p>
                  </div>

                  {uploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Camera Settings */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Label className="text-sm">Camera Settings</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={mirrored}
                        onCheckedChange={setMirrored}
                        disabled={!isWebcamOn}
                      />
                      <Label className="text-sm">Mirror</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={facingMode === "environment"}
                        onCheckedChange={(checked) =>
                          setFacingMode(checked ? "environment" : "user")
                        }
                        disabled={!isWebcamOn}
                      />
                      <Label className="text-sm">Rear Camera</Label>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setIsCameraOpen(false)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewStudentPage;
