export default function TeachersPage() {
  return (
    <div>
      <h2>👨‍🏫 Faculty Members</h2>
      <p className="mt-4">Assign teachers to subjects and view workload.</p>

      <div className="flex gap mt-6">
        <div className="card">
          <h3>Dr. Sharma</h3>
          <p>Mathematics</p>
          <p>📚 12 Classes/week</p>
        </div>
        <div className="card">
          <h3>Prof. Verma</h3>
          <p>Physics</p>
          <p>📚 10 Classes/week</p>
        </div>
        <div className="card">
          <h3>Ms. Gupta</h3>
          <p>Chemistry</p>
          <p>📚 8 Classes/week</p>
        </div>
      </div>

      <button className="mt-6">➕ Add Faculty</button>
    </div>
  );
}
