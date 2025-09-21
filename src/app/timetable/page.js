"use client";

import { useEffect, useState } from "react";

export default function TimetablePage() {
  const [facultyList, setFacultyList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [course, setCourse] = useState("B.Ed");
  const [semester, setSemester] = useState(1);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const timeSlots = ["09:00-10:00","10:00-11:00","11:00-12:00","12:00-13:00","14:00-15:00","15:00-16:00"];

  useEffect(() => {
    fetch("/api/faculty").then(r => r.json()).then(setFacultyList);
    fetch("/api/rooms").then(r => r.json()).then(setRoomList);
  }, []);

  const generateTimetable = () => {
    if(!facultyList.length || !roomList.length) return alert("No faculty or rooms!");
    const newSchedule = days.map(day => ({
      day,
      sessions: timeSlots.map((slot, i) => ({
        course: `Subject ${i+1}`,
        faculty: facultyList[i % facultyList.length].name,
        room: roomList[i % roomList.length].name
      }))
    }));
    setSchedule(newSchedule);
  };

  const saveTimetable = async () => {
    const res = await fetch("/api/timetable", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({course, semester, schedule})
    });
    if(res.ok) alert("Saved successfully!");
  };

  const downloadPDF = () => window.print();
  const copyToClipboard = () => navigator.clipboard.writeText(JSON.stringify(schedule, null, 2));
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(JSON.stringify(schedule))}`, "_blank");

  return (
    <div>
      <h2>New Timetable</h2>

      <div>
        <label>Course:</label>
        <select value={course} onChange={e=>setCourse(e.target.value)}>
          <option>B.Ed</option>
          <option>M.Ed</option>
          <option>FYUP</option>
          <option>ITEP</option>
        </select>

        <label>Semester:</label>
        <select value={semester} onChange={e=>setSemester(Number(e.target.value))}>
          {[1,2,3,4,5,6,7,8].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      <button onClick={generateTimetable}>Generate Timetable</button>

      {schedule.length > 0 && (
        <div>
          <h3>Generated Timetable</h3>
          <table>
            <thead>
              <tr>
                <th>Day / Time</th>
                {timeSlots.map(slot => <th key={slot}>{slot}</th>)}
              </tr>
            </thead>
            <tbody>
              {schedule.map(row => (
                <tr key={row.day}>
                  <td>{row.day}</td>
                  {row.sessions.map((s,i) => <td key={i}>{s.course}<br />{s.faculty}<br />{s.room}</td>)}
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <button onClick={saveTimetable}>Save</button>
            <button onClick={downloadPDF}>Download PDF</button>
            <button onClick={copyToClipboard}>Copy</button>
            <button onClick={shareWhatsApp}>Send to WhatsApp</button>
          </div>
        </div>
      )}
    </div>
  );
}
