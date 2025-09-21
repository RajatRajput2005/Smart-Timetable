"use client";
import { useEffect, useState } from "react";

export default function TeachersPage() {
  const [faculty, setFaculty] = useState([]);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    fetch("/api/faculty").then(res => res.json()).then(setFaculty);
  }, []);

  const addFaculty = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/faculty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, department }),
    });
    if (res.ok) {
      const newF = await res.json();
      setFaculty([...faculty, newF]);
      setName("");
      setDepartment("");
    }
  };

  return (
    <div>
      <h2>Faculty Management</h2>
      <form onSubmit={addFaculty} style={{ marginBottom: "1rem" }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Faculty Name"
          required
        />
        <input
          value={department}
          onChange={e => setDepartment(e.target.value)}
          placeholder="Department"
        />
        <button type="submit">Add Faculty</button>
      </form>

      <table>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Department</th></tr>
        </thead>
        <tbody>
          {faculty.map(f => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.name}</td>
              <td>{f.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
