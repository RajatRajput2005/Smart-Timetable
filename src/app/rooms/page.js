export default function RoomsPage() {
  return (
    <div>
      <h2>🏢 Room Management</h2>
      <p className="mt-4">Manage classroom capacities and availability.</p>

      <div className="flex gap mt-6">
        <div className="card">
          <h3>Room 101</h3>
          <p>Capacity: 40</p>
          <p>Status: ✅ Available</p>
        </div>
        <div className="card">
          <h3>Room 102</h3>
          <p>Capacity: 60</p>
          <p>Status: ❌ In Use</p>
        </div>
        <div className="card">
          <h3>Lab 201</h3>
          <p>Capacity: 25</p>
          <p>Status: ✅ Available</p>
        </div>
      </div>

      <button className="mt-6">➕ Add Room</button>
    </div>
  );
}
