import { NextResponse } from "next/server";

let rooms = [
  { id: 1, name: "Room 101", capacity: 40, busy: [] },
  { id: 2, name: "Lab 202", capacity: 25, busy: [] },
];

// GET
export async function GET() {
  return NextResponse.json(rooms);
}

// POST
export async function POST(req) {
  try {
    const body = await req.json();
    const newRoom = {
      id: rooms.length + 1,
      name: body.name,
      capacity: body.capacity || 30,
      busy: []
    };
    rooms.push(newRoom);
    return NextResponse.json(newRoom, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

// PATCH: mark room busy
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, day, timeSlot } = body;
    const room = rooms.find(r => r.id === id);
    if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

    room.busy.push({ day, timeSlot });
    return NextResponse.json(room);
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
