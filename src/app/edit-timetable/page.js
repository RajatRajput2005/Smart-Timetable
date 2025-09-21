export default function EditTimetablePage() {
  return (
    <div>
      <h2>Edit Timetable</h2>
      <p className="mt-4">Modify timetable entries directly in the grid below:</p>

      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>9:00 - 10:00</th>
            <th>10:00 - 11:00</th>
            <th>11:00 - 12:00</th>
            <th>12:00 - 1:00</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Monday</td>
            <td><input type="text" defaultValue="Maths" /></td>
            <td><input type="text" defaultValue="Physics" /></td>
            <td><input type="text" defaultValue="English" /></td>
            <td><input type="text" defaultValue="Break" /></td>
          </tr>
          <tr>
            <td>Tuesday</td>
            <td><input type="text" defaultValue="Science" /></td>
            <td><input type="text" defaultValue="Geography" /></td>
            <td><input type="text" defaultValue="English" /></td>
            <td><input type="text" defaultValue="Break" /></td>
          </tr>
        </tbody>
      </table>

      <button className="mt-4">Save Changes</button>
    </div>
  );
}
