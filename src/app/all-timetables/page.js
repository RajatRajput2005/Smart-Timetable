"use client";
import { useEffect, useState } from "react";

export default function AllTimetablesPage() {
  const [timetables, setTimetables] = useState([]);

  useEffect(() => {
    fetch("/api/timetable")
      .then((r) => r.json())
      .then(setTimetables);
  }, []);

  return (
    <div>
      <h2>📋 All Timetables</h2>
      {timetables.length === 0 ? (
        <p>No timetables saved yet.</p>
      ) : (
        <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Course</th>
              <th>Semester</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {timetables.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.course}</td>
                <td>{t.semester}</td>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
