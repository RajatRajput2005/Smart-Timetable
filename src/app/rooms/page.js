"use client";
import { useEffect, useState } from "react";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");

  useEffect(() => {
    fetch("/api/rooms").then(res => res.json()).then(setRooms);
  }, []);

  const addRoom = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, capacity: parseInt(capacity) }),
    });
    if (res.ok) {
      const newR = await res.json();
      setRooms([...rooms, newR]);
      setName("");
      setCapacity("");
    }
  };

  return (
    <div>
      <h2>Rooms Management</h2>
      <form onSubmit={addRoom} style={{ marginBottom: "1rem" }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Room Name"
          required
        />
        <input
          value={capacity}
          onChange={e => setCapacity(e.target.value)}
          placeholder="Capacity"
          type="number"
        />
        <button type="submit">Add Room</button>
      </form>

      <table>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Capacity</th></tr>
        </thead>
        <tbody>
          {rooms.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.name}</td>
              <td>{r.capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
