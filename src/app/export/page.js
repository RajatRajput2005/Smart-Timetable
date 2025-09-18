export default function ExportPage() {
  return (
    <div>
      <h2>📤 Export & Share</h2>
      <p className="mt-4">Download or share timetables in different formats.</p>

      <div className="flex gap mt-6">
        <button>⬇️ Export as PDF</button>
        <button>⬇️ Export as Excel</button>
        <button>⬇️ Export as CSV</button>
        <button>🔗 Generate Share Link</button>
      </div>

      <div className="mt-6">
        <h3>📈 Export History</h3>
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>Format</th>
              <th>Date</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>B.Ed_Timetable</td>
              <td>PDF</td>
              <td>2025-09-15</td>
              <td>1.2 MB</td>
            </tr>
            <tr>
              <td>FYUP_Sem5</td>
              <td>Excel</td>
              <td>2025-09-12</td>
              <td>800 KB</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
