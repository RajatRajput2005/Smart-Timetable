import { NextResponse } from "next/server";

// In-memory demo data
let timeSlots = [
  { id: 1, label: "09:00-10:00" },
  { id: 2, label: "10:00-11:00" },
  { id: 3, label: "11:00-12:00" },
  { id: 4, label: "12:00-13:00" },
  { id: 5, label: "14:00-15:00" },
  { id: 6, label: "15:00-16:00" },
  { id: 7, label: "16:00-17:00" },
  { id: 8, label: "17:00-18:00" },
];

export async function GET() {
  return NextResponse.json(timeSlots);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newSlot = { id: timeSlots.length + 1, label: body.label };
    timeSlots.push(newSlot);
    return NextResponse.json(newSlot, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
