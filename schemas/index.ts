import * as z from "zod";

export const LoginSchema = z.object({
  email: z.email({ message: "Email is required!" }),
  password: z.string().min(1, { message: "Password is requied!" }),
});

export const RegisterSchema = z.object({
  firstname: z.string().min(1, { message: "First Name is required" }),
  lastname: z.string().min(1, { message: "Last Name is required" }),
  email: z.email({ message: "Email is required!" }),
  password: z.string().min(6, { message: "Minimum 6 Character required!" }),
});

export const profileSchema = z.object({
  userid: z.string().optional(),
  firstname: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  lastname: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  avatar: z.string(),
  avatarPublicId: z.string().optional(),
  lastlogin: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
  imageToDelete: z.string().optional(),
  digitaladdress: z.string().optional(),
  city: z.string().optional(),
  landmark: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  phonenumber: z.string().optional(),
});

export const categorySchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
});

export const menuItemSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  category: z.string().optional(),
  image: z.string().optional(),
  imagePublicId: z.string().optional(),
});

export const orderSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  userId: z.string(),
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
    })
  ),
  totalAmount: z
    .number()
    .min(0, { message: "Total amount must be a positive number" }),
  status: z.enum(["pending", "completed", "cancelled"]).optional(),
});

export const reviewSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  userId: z.string(),
  menuItemId: z.string(),
  rating: z.number().min(1).max(5, {
    message: "Rating must be between 1 and 5",
  }),
  comment: z.string().optional(),
});

export const adminProfileSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  firstname: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  lastname: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Email is required!" }),
  isAdmin: z.string().optional(),
  avatar: z.string(),
  avatarPublicId: z.string().optional(),
  phonenumber: z.string().optional(),
  userid: z.string().optional(),
});
