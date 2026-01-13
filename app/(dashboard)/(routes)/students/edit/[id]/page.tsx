// app/students/edit/[id]/page.tsx
"use client";
import EditStudentForm from "../../../../_components/EditStudentForm";
import { useParams } from "next/navigation";

const EditStudentPage = () => {
  const params = useParams();

  // Type assertion if you're confident it's always a string
  const studentId = params.id as string;

  return <EditStudentForm studentId={studentId} />;
};

export default EditStudentPage;
