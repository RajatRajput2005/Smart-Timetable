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
      <div style={{marginBottom: "2rem"}}>
        <h2>New Timetable</h2>
        <p>Create a new academic schedule for your institution</p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Program Type</label>
          <select value={course} onChange={e=>setCourse(e.target.value)}>
            <option value="B.Ed">Bachelor of Education (B.Ed)</option>
            <option value="M.Ed">Master of Education (M.Ed)</option>
            <option value="FYUP">Four Year Undergraduate Program</option>
            <option value="ITEP">Integrated Teacher Education Program</option>
          </select>
        </div>

        <div className="form-group">
          <label>Academic Semester</label>
          <select value={semester} onChange={e=>setSemester(Number(e.target.value))}>
            {[1,2,3,4,5,6,7,8].map(s=><option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
      </div>

      <div style={{marginTop: "2rem"}}>
        <button onClick={generateTimetable} disabled={loading}>
          {loading ? "Generating..." : "Generate Timetable"}
        </button>
        <button className="btn-secondary">Load Template</button>
      </div>

      {schedule.length > 0 && (
        <div style={{marginTop: "3rem"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem"}}>
            <div>
              <h3>Generated Timetable</h3>
              <p style={{color: "#64748b", margin: 0}}>{course} - Semester {semester}</p>
            </div>
            <div style={{background: "#f0fdf4", color: "#166534", padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.875rem", fontWeight: "600"}}>
              Schedule Ready
            </div>
          </div>

          <div className="table-container">
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
                    <td style={{fontWeight: "700", background: "#f8fafc"}}>{row.day}</td>
                    {row.sessions.map((s,i) => (
                      <td key={i} style={{padding: "1rem"}}>
                        <div style={{fontWeight: "600", color: "#0f172a", marginBottom: "0.25rem"}}>
                          {s.course}
                        </div>
                        <div style={{fontSize: "0.875rem", color: "#64748b"}}>
                          Faculty: {s.faculty}
                        </div>
                        <div style={{fontSize: "0.875rem", color: "#64748b"}}>
                          Room: {s.room}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{display: "flex", gap: "0.75rem", marginTop: "2rem", flexWrap: "wrap"}}>
            <button onClick={saveTimetable}>Save Schedule</button>
            <button onClick={downloadPDF}>Download PDF</button>
            <button className="btn-secondary" onClick={copyToClipboard}>Copy Data</button>
            <button className="btn-secondary" onClick={shareWhatsApp}>Share via WhatsApp</button>
          </div>
        </div>
      )}
    </div>
  );
}
