import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const timetables = await prisma.timetable.findMany();
  return new Response(JSON.stringify(timetables));
}

export async function POST(req) {
  const body = await req.json();
  if (!body.course || !body.semester || !body.schedule) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  const newTT = await prisma.timetable.create({
    data: {
      course: body.course,
      semester: body.semester,
      schedule: body.schedule
    }
  });

  return new Response(JSON.stringify(newTT), { status: 201 });
}
