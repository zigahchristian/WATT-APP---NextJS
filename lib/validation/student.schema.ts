import { z } from "zod";

// Gender enum
export const GenderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);
export type Gender = z.infer<typeof GenderEnum>;

// Status enum
export const StatusEnum = z.enum(["ACTIVE", "INACTIVE", "GRADUATED"]);
export type Status = z.infer<typeof StatusEnum>;

// Phone number validation (international format)
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

// Email validation
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Date validation - must be at least 5 years old and not more than 100
const isDateValid = (date: Date) => {
  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 100); // Max 100 years old
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() - 5); // Min 5 years old

  return date >= minDate && date <= maxDate;
};

// Profile image validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Base student schema for form validation
export const studentSchema = z.object({
  studentId: z.string(),
  // Personal Information
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]*$/, "First name can only contain letters and spaces"),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]*$/, "Last name can only contain letters and spaces"),

  gender: GenderEnum.default("MALE"),

  dob: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .transform((val) => new Date(val))
    .refine(isDateValid, {
      message: "Date of birth must be between 5 and 100 years ago",
    }),

  // Contact Information
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .regex(emailRegex, "Invalid email format")
    .transform((val) => val.toLowerCase()),

  phone: z.string(),

  address: z.string().max(200, "Address must be less than 200 characters"),

  // Status
  status: StatusEnum.default("ACTIVE"),
  enrollmentdate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .transform((val) => new Date(val)),

  // Additional Information (Optional)
  emergencyContactName: z
    .string()
    .max(100, "Emergency contact name must be less than 100 characters")
    .optional(),

  emergencyContactPhone: z
    .string()
    .optional()
    .refine((val) => !val || phoneRegex.test(val), {
      message: "Invalid emergency phone number format",
    }),
  imageUrl: z.string(),
  course: z.string(),
});

export const studentFormSchema = z.object({
  studentId: z.string(),
  // Personal Information
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]*$/, "First name can only contain letters and spaces"),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]*$/, "Last name can only contain letters and spaces"),

  gender: GenderEnum.default("MALE"),

  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .transform((val) => new Date(val))
    .refine(isDateValid, {
      message: "Date of birth must be between 5 and 100 years ago",
    }),

  // Contact Information
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .regex(emailRegex, "Invalid email format")
    .transform((val) => val.toLowerCase()),

  phone: z.string(),

  address: z.string().max(200, "Address must be less than 200 characters"),

  // Status
  status: StatusEnum.default("ACTIVE"),

  enrollmentdate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .transform((val) => new Date(val)),

  // Additional Information (Optional)
  emergencyContactName: z
    .string()
    .max(100, "Emergency contact name must be less than 100 characters")
    .optional(),

  emergencyContactPhone: z
    .string()
    .optional()
    .refine((val) => !val || phoneRegex.test(val), {
      message: "Invalid emergency phone number format",
    }),

  imageUrl: z.string(),
  course: z.string(),
});
// Schema for profile image upload
export const profileImageSchema = z.object({
  profileImage: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
      message: "Profile image must be less than 5MB",
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Only .jpg, .jpeg, .png, .gif, and .webp files are accepted",
    }),
});

// Combined schema for form submission (including image)
export const studentCreateSchema = studentFormSchema.merge(profileImageSchema);

// Schema for update (all fields optional except ID)
export const studentUpdateSchema = studentFormSchema.partial().merge(
  z.object({
    id: z.string().cuid(),
  })
);

// Schema for bulk operations
export const studentBulkSchema = z.object({
  students: z
    .array(studentFormSchema)
    .min(1, "At least one student is required"),
});

// Schema for CSV/Excel import
export const studentImportSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File must be less than 10MB",
    })
    .refine(
      (file) =>
        [
          "text/csv",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ].includes(file.type),
      { message: "Only CSV and Excel files are accepted" }
    ),
});

// Schema for search/filter
export const studentFilterSchema = z.object({
  search: z.string().optional(),
  status: StatusEnum.optional(),
  gender: GenderEnum.optional(),
  minAge: z.number().min(5).max(100).optional(),
  maxAge: z.number().min(5).max(100).optional(),
  enrolledAfter: z.string().optional(),
  enrolledBefore: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z
    .enum([
      "firstName",
      "lastName",
      "email",
      "status",
      "enrollmentDate",
      "createdAt",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Schema for API response
export const studentResponseSchema = z.object({
  success: z.boolean(),
  data: studentFormSchema
    .extend({
      id: z.string().cuid(),
      studentId: z.string(),
      enrollmentDate: z.date(),
      profileImage: z.string().optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
      fees: z
        .array(
          z.object({
            id: z.string().cuid(),
            amount: z.number(),
            status: z.string(),
            dueDate: z.date(),
          })
        )
        .optional(),
    })
    .optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  pagination: z
    .object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    })
    .optional(),
});

// Schema for student statistics
export const studentStatsSchema = z.object({
  total: z.number(),
  active: z.number(),
  inactive: z.number(),
  graduated: z.number(),
  male: z.number(),
  female: z.number(),
  other: z.number(),
  averageAge: z.number(),
  newThisMonth: z.number(),
  totalFees: z.number(),
  paidFees: z.number(),
  pendingFees: z.number(),
});

// Helper functions
export const getAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

export const formatStudentName = (
  firstName: string,
  lastName: string
): string => {
  return `${firstName} ${lastName}`.trim();
};

export const validateStudentEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

export const validateStudentPhone = (phone: string): boolean => {
  return phoneRegex.test(phone);
};
