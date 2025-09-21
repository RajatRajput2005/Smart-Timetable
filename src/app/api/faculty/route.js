import { NextResponse } from "next/server";

let facultyList = [
  { id: 1, name: "Dr. Sharma", department: "Math", busy: [] }, // busy = array of {day, timeSlot}
  { id: 2, name: "Prof. Singh", department: "Science", busy: [] },
];

// GET: list all faculty
export async function GET() {
  return NextResponse.json(facultyList);
}

// POST: add new faculty
export async function POST(req) {
  try {
    const body = await req.json();
    const newFaculty = {
      id: facultyList.length + 1,
      name: body.name,
      department: body.department || "General",
      busy: []
    };
    facultyList.push(newFaculty);
    return NextResponse.json(newFaculty, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

// PATCH: mark faculty busy
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, day, timeSlot } = body;
    const faculty = facultyList.find(f => f.id === id);
    if (!faculty) return NextResponse.json({ error: "Not found" }, { status: 404 });

    faculty.busy.push({ day, timeSlot });
    return NextResponse.json(faculty);
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
