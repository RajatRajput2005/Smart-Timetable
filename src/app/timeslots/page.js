export default function TimeslotsPage() {
  return (
    <div>
      <h2>⏰ Time Slot Configuration</h2>
      <p className="mt-4">Define time slots for scheduling classes:</p>

      <table>
        <thead>
          <tr>
            <th>Slot</th>
            <th>Start Time</th>
            <th>End Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td><input type="time" defaultValue="09:00" /></td>
            <td><input type="time" defaultValue="10:00" /></td>
          </tr>
          <tr>
            <td>2</td>
            <td><input type="time" defaultValue="10:00" /></td>
            <td><input type="time" defaultValue="11:00" /></td>
          </tr>
          <tr>
            <td>3</td>
            <td><input type="time" defaultValue="11:00" /></td>
            <td><input type="time" defaultValue="12:00" /></td>
          </tr>
        </tbody>
      </table>

      <button className="mt-4">💾 Save Slots</button>
    </div>
  );
}
