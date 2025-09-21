"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function ExportContent() {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useSearchParams();
  const id = params.get("id");
  const tableRef = useRef();

  useEffect(() => {
    setLoading(true);
    fetch("/api/timetable")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.length > 0) {
          // If ID is provided, find specific timetable, otherwise use the most recent one
          const found = id ? data.find((t) => String(t.id) === id) : data[data.length - 1];
          if (found) {
            setTimetable(found);
          } else {
            setError("Timetable not found");
          }
        } else {
          setError("No timetables available. Please create a timetable first.");
        }
      })
      .catch((error) => {
        console.error("Error fetching timetables:", error);
        setError("Error loading timetable data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const downloadPDF = async () => {
    const input = tableRef.current;
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "pt", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.text(`Smart Timetable - ${timetable.course} Semester ${timetable.semester}`, 40, 30);
    pdf.addImage(imgData, "PNG", 20, 50, pdfWidth - 40, pdfHeight - 60);
    pdf.save(`timetable-${timetable.course}-sem${timetable.semester}.pdf`);
  };

  if (loading) return <div style={{padding: "2rem", textAlign: "center"}}><p>Loading timetable data...</p></div>;
  if (error) return <div style={{padding: "2rem", textAlign: "center", color: "#ef4444"}}><p>{error}</p><p style={{marginTop: "1rem"}}><a href="/timetable" style={{color: "#7c3aed"}}>Go create a timetable first</a></p></div>;
  if (!timetable) return <div style={{padding: "2rem", textAlign: "center"}}><p>No timetable available</p><p style={{marginTop: "1rem"}}><a href="/timetable" style={{color: "#7c3aed"}}>Go create a timetable first</a></p></div>;
  if (!timetable.schedule || timetable.schedule.length === 0) return <div style={{padding: "2rem", textAlign: "center"}}><p>This timetable has no schedule data</p><p style={{marginTop: "1rem"}}><a href="/timetable" style={{color: "#7c3aed"}}>Go create a new timetable</a></p></div>;

  return (
    <div>
      <h2>Export Timetable</h2>
      <div ref={tableRef} style={{ background: "#fff", padding: "1rem" }}>
        <h3>
          {timetable.course} - Semester {timetable.semester}
        </h3>
        <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%", marginTop: "1rem" }}>
          <thead style={{ background: "#ddd" }}>
            <tr>
              <th>Day / Time</th>
              {timetable.schedule && timetable.schedule[0] && timetable.schedule[0].sessions.map((_, i) => (
                <th key={i}>Slot {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timetable.schedule && timetable.schedule.map((row, i) => (
              <tr key={i}>
                <td><b>{row.day}</b></td>
                {row.sessions && row.sessions.map((s, j) => (
                  <td key={j}>
                    <b>{s.course}</b> <br />
                    Faculty: {s.faculty} <br />
                    Room: {s.room}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={downloadPDF} style={{ marginTop: "1rem" }}>
        Download PDF
      </button>
    </div>
  );
}

export default function ExportPage() {
  return (
    <Suspense fallback={<div>Loading export...</div>}>
      <ExportContent />
    </Suspense>
  );
}
