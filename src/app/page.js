export default function HomePage() {
  return (
    <div>
      <h2>📊 Dashboard Overview</h2>
      <p className="mt-2">Welcome back! Here’s the latest system summary.</p>

      {/* Stats Cards */}
      <div className="grid-4 mt-6">
        <div className="card">
          <h3>12</h3>
          <p>Active Timetables</p>
        </div>
        <div className="card">
          <h3>847</h3>
          <p>Total Students</p>
        </div>
        <div className="card">
          <h3>32</h3>
          <p>Faculty Members</p>
        </div>
        <div className="card">
          <h3>24</h3>
          <p>Available Rooms</p>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-6" style={{ padding: "1rem", background: "#065f46", borderRadius: "8px" }}>
        ✅ System Status: All timetables optimized with zero conflicts.
      </div>

      {/* Analytics Section */}
      <div className="mt-6 flex gap">
        {/* Progress Circles */}
        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ fontSize: "1.2rem" }}>Student Attendance</h3>
          <div className="circle-progress" data-percent="85">
            <span>85%</span>
          </div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ fontSize: "1.2rem" }}>Faculty Utilization</h3>
          <div className="circle-progress purple" data-percent="72">
            <span>72%</span>
          </div>
        </div>
      </div>

      {/* Bar Graph (CSS Only) */}
      <div className="card mt-6">
        <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Weekly Class Distribution</h3>
        <div className="bar-chart">
          <div><div className="bar" style={{ height: "80%" }}></div><span>Mon</span></div>
          <div><div className="bar" style={{ height: "60%" }}></div><span>Tue</span></div>
          <div><div className="bar" style={{ height: "90%" }}></div><span>Wed</span></div>
          <div><div className="bar" style={{ height: "50%" }}></div><span>Thu</span></div>
          <div><div className="bar" style={{ height: "70%" }}></div><span>Fri</span></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-6">
        <h3 style={{ fontSize: "1.2rem" }}>⚡ Quick Actions</h3>
        <div className="flex gap mt-2">
          <button>B.Ed Programs</button>
          <button>M.Ed Programs</button>
          <button>FYUP</button>
          <button>ITEP</button>
        </div>
      </div>
    </div>
  );
}
