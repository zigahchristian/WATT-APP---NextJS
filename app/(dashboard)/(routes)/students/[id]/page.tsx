"use client";
import ViewStudentPage from "../../../_components/ViewStudentForm";
import { useParams } from "next/navigation";

export default function ViewStudent() {
  const params = useParams();

  // Type assertion if you're confident it's always a string
  const studentId = params.id as string;

  return <ViewStudentPage studentId={studentId} />;
}
