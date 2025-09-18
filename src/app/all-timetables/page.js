export default function AllTimetablesPage() {
  return (
    <div>
      <h2>📋 All Timetables</h2>
      <p className="mt-4">Manage all created timetables from here.</p>

      <table>
        <thead>
          <tr>
            <th>Program</th>
            <th>Semester</th>
            <th>Students</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>B.Ed</td>
            <td>Year 1 - Sem 1</td>
            <td>45</td>
            <td>✅ Active</td>
            <td>2 hours ago</td>
            <td>
              <button>👁️ View</button>
              <button>✏️ Edit</button>
            </td>
          </tr>
          <tr>
            <td>M.Ed</td>
            <td>Year 2 - Sem 3</td>
            <td>32</td>
            <td>🕒 Draft</td>
            <td>1 day ago</td>
            <td>
              <button>👁️ View</button>
              <button>✏️ Edit</button>
            </td>
          </tr>
          <tr>
            <td>FYUP</td>
            <td>Sem 5</td>
            <td>120</td>
            <td>✅ Active</td>
            <td>5 days ago</td>
            <td>
              <button>👁️ View</button>
              <button>✏️ Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
