"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function ExportContent() {
  const [timetable, setTimetable] = useState(null);
  const params = useSearchParams();
  const id = params.get("id");
  const tableRef = useRef();

  useEffect(() => {
    fetch("/api/timetable")
      .then((r) => r.json())
      .then((data) => {
        const found = data.find((t) => String(t.id) === id);
        setTimetable(found);
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

  if (!timetable) return <p>Loading timetable...</p>;

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
              {timetable.schedule[0].sessions.map((_, i) => (
                <th key={i}>Slot {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timetable.schedule.map((row, i) => (
              <tr key={i}>
                <td><b>{row.day}</b></td>
                {row.sessions.map((s, j) => (
                  <td key={j}>
                    <b>{s.course}</b> <br />
                    {s.faculty} <br />
                    {s.room}
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
