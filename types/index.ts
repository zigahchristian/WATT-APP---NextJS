export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  course: string;
  enrollmentdate: Date;
  imageUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  fees?: Fee[];
}

export interface Fee {
  id: number;
  studentId: number;
  amount: number;
  dueDate: Date;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  paymentDate?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  student?: Student;
}
