import prisma from "@/lib/prisma";
// POST /api/timetable
export async function POST(req: Request) {
  const body = await req.json();

  if (!Array.isArray(body.timeSlots)) {
    return Response.json(
      { error: "Invalid timeSlots format" },
      { status: 400 }
    );
  }

  await prisma.timetable.upsert({
    where: { id: "main" },
    update: { timeSlots: body.timeSlots },
    create: { id: "main", timeSlots: body.timeSlots },
  });

  return Response.json({ success: true });
}

// GET /api/timetable
export async function GET() {
  const timetable = await prisma.timetable.findUnique({
    where: { id: "main" },
  });

  return Response.json(timetable ?? { timeSlots: [] });
}
