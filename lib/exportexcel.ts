// utils/export-to-excel.ts
/*
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Student } from "@prisma/client";

interface StudentWithFees extends Student {
  fees?: any[];
}

interface ExportOptions {
  includeFees?: boolean;
  dateFormat?: string;
  filename?: string;
  sheetName?: string;
}


export async function exportStudentsToExcel(
  students: StudentWithFees[],
  options: ExportOptions = {}
): Promise<void> {
  const {
    includeFees = false,
    dateFormat = "dd/MM/yyyy",
    filename = `students_${new Date().toISOString().split("T")[0]}`,
    sheetName = "Students",
  } = options;

  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Add worksheet
    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ showGridLines: true }],
      properties: { tabColor: { argb: "FF4F81BD" } },
    });

    // Define columns for main student data
    const columns = [
      { header: "Student ID", key: "studentId", width: 15 },
      { header: "First Name", key: "firstName", width: 15 },
      { header: "Last Name", key: "lastName", width: 15 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Date of Birth", key: "dob", width: 12 },
      { header: "Age", key: "age", width: 8 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Address", key: "address", width: 30 },
      { header: "Course", key: "course", width: 20 },
      { header: "Enrollment Date", key: "enrollmentDate", width: 15 },
      { header: "Emergency Contact", key: "emergencyContactName", width: 20 },
      { header: "Emergency Phone", key: "emergencyContactPhone", width: 15 },
      { header: "Status", key: "status", width: 12 },
      { header: "Created At", key: "createdAt", width: 15 },
      { header: "Updated At", key: "updatedAt", width: 15 },
    ];

    if (includeFees) {
      columns.push(
        { header: "Total Fees", key: "totalFees", width: 12 },
        { header: "Paid Amount", key: "paidAmount", width: 12 },
        { header: "Balance", key: "balance", width: 12 },
        { header: "Payment Status", key: "paymentStatus", width: 15 }
      );
    }

    // Add columns to worksheet
    worksheet.columns = columns;

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F81BD" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 25;

    // Add data rows
    students.forEach((student, index) => {
      const age = student.dob
        ? Math.floor(
            (new Date().getTime() - new Date(student.dob).getTime()) /
              (1000 * 60 * 60 * 24 * 365.25)
          )
        : null;

      const rowData: any = {
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        gender: student.gender,
        dob: student.dob
          ? formatDate(new Date(student.dob), dateFormat)
          : "N/A",
        age: age,
        email: student.email,
        phone: student.phone,
        address: student.address,
        course: student.course,
        enrollmentDate: student.enrollmentdate
          ? formatDate(new Date(student.enrollmentdate), dateFormat)
          : "N/A",
        emergencyContactName: student.emergencyContactName,
        emergencyContactPhone: student.emergencyContactPhone,
        status: student.status,
        createdAt: formatDate(new Date(student.createdAt), dateFormat),
        updatedAt: formatDate(new Date(student.updatedAt), dateFormat),
      };

      if (includeFees && student.fees) {
        const feesData = calculateFeesSummary(student.fees);
        rowData.totalFees = feesData.total;
        rowData.paidAmount = feesData.paid;
        rowData.balance = feesData.balance;
        rowData.paymentStatus = feesData.status;
      }

      const row = worksheet.addRow(rowData);

      // Add alternate row coloring
      if (index % 2 === 0) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF2F2F2" },
        };
      }

      // Style date cells
      ["dob", "enrollmentDate", "createdAt", "updatedAt"].forEach((key) => {
        if (row.getCell(key).value !== "N/A") {
          row.getCell(key).numFmt =
            dateFormat === "dd/MM/yyyy" ? "dd/mm/yyyy" : "mm/dd/yyyy";
        }
      });

      // Style number cells
      if (includeFees) {
        ["totalFees", "paidAmount", "balance"].forEach((key) => {
          const cell = row.getCell(key);
          if (typeof cell.value === "number") {
            cell.numFmt = "#,##0.00";
            cell.font = { bold: cell.value < 0 };
            cell.fill =
              cell.value < 0
                ? {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFFFCCCC" },
                  }
                : undefined;
          }
        });
      }
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (column.width) {
        const maxLength = Math.max(
          column.header.length,
          ...students.map((student) => {
            const value = getCellValue(student, column.key);
            return value ? value.toString().length : 0;
          })
        );
        column.width = Math.min(maxLength + 2, 50); // Cap at 50 characters
      }
    });

    // Add summary statistics
    addSummaryStatistics(worksheet, students, includeFees);

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${filename}.xlsx`);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw new Error("Failed to export students data");
  }
}

// Helper function to format dates
function formatDate(date: Date, format: string): string {
  if (format === "dd/MM/yyyy") {
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  } else if (format === "MM/dd/yyyy") {
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  }
  return date.toISOString().split("T")[0];
}

// Helper function to calculate fees summary
function calculateFeesSummary(fees: any[]): {
  total: number;
  paid: number;
  balance: number;
  status: string;
} {
  const total = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
  const paid = fees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
  const balance = total - paid;

  let status = "Pending";
  if (paid >= total) status = "Paid";
  else if (paid > 0) status = "Partial";
  else if (balance > 0) status = "Unpaid";

  return { total, paid, balance, status };
}

// Helper function to get cell value
function getCellValue(student: StudentWithFees, key: string): any {
  const value = (student as any)[key];
  if (value instanceof Date) return formatDate(value, "dd/MM/yyyy");
  return value;
}

// Add summary statistics
function addSummaryStatistics(
  worksheet: ExcelJS.Worksheet,
  students: StudentWithFees[],
  includeFees: boolean
): void {
  const startRow = students.length + 3;

  // Add summary header
  worksheet.mergeCells(`A${startRow}:D${startRow}`);
  const summaryHeader = worksheet.getCell(`A${startRow}`);
  summaryHeader.value = "SUMMARY STATISTICS";
  summaryHeader.font = { bold: true, size: 14 };
  summaryHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9E1F2" },
  };

  // Calculate statistics
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "ACTIVE").length;
  const maleStudents = students.filter((s) => s.gender === "MALE").length;
  const femaleStudents = students.filter((s) => s.gender === "FEMALE").length;

  const stats = [
    ["Total Students", totalStudents],
    ["Active Students", activeStudents],
    ["Male Students", maleStudents],
    ["Female Students", femaleStudents],
    ["Average Age", calculateAverageAge(students)],
  ];

  if (includeFees) {
    const totalFees = students.reduce((sum, student) => {
      const fees = student.fees || [];
      return sum + fees.reduce((feeSum, fee) => feeSum + (fee.amount || 0), 0);
    }, 0);

    const totalPaid = students.reduce((sum, student) => {
      const fees = student.fees || [];
      return (
        sum + fees.reduce((feeSum, fee) => feeSum + (fee.paidAmount || 0), 0)
      );
    }, 0);

    stats.push(
      ["Total Fees", totalFees],
      ["Total Paid", totalPaid],
      ["Total Balance", totalFees - totalPaid]
    );
  }

  // Add statistics rows
  stats.forEach(([label, value], index) => {
    const rowNum = startRow + index + 1;
    worksheet.getCell(`A${rowNum}`).value = label;
    worksheet.getCell(`B${rowNum}`).value = value;

    if (typeof value === "number") {
      worksheet.getCell(`B${rowNum}`).numFmt = "#,##0.00";
      worksheet.getCell(`B${rowNum}`).font = { bold: true };
    }
  });
}

// Calculate average age
function calculateAverageAge(students: StudentWithFees[]): number {
  const validAges = students
    .filter((s) => s.dob)
    .map((s) => {
      const dob = new Date(s.dob!);
      return Math.floor(
        (new Date().getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      );
    });

  if (validAges.length === 0) return 0;
  return Number(
    (validAges.reduce((a, b) => a + b, 0) / validAges.length).toFixed(1)
  );
}
*/
