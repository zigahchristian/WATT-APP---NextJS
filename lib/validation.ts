import { z } from "zod";

export const studentSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED"]).default("ACTIVE"),
});

export const feeSchema = z.object({
  studentId: z.string(),
  amount: z.number().positive("Amount must be positive"),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER"]),
  status: z.enum(["PENDING", "PAID", "PARTIAL", "OVERDUE"]).default("PENDING"),
  description: z.string().optional(),
});

export type StudentFormData = z.infer<typeof studentSchema>;
export type FeeFormData = z.infer<typeof feeSchema>;
