import Link from "next/link";

export default function Home() {
  return (
    <div className="home-container">
      <h1 className="title">Smart Timetable System</h1>
      
      <div className="cards-grid">
        <div className="card">
          <h2>Create Timetable</h2>
          <p>Generate optimized timetables for your institution</p>
          <Link href="/timetable" className="button-primary">
            Create Now
          </Link>
        </div>
        
        <div className="card">
          <h2>Manage Teachers</h2>
          <p>Add and manage teacher information</p>
          <Link href="/teachers" className="button-primary">
            Manage
          </Link>
        </div>
        
        <div className="card">
          <h2>View All Timetables</h2>
          <p>Browse existing timetables</p>
          <Link href="/all-timetables" className="button-primary">
            View All
          </Link>
        </div>
        
        <div className="card">
          <h2>Manage Rooms</h2>
          <p>Configure room availability</p>
          <Link href="/rooms" className="button-primary">
            Configure
          </Link>
        </div>
      </div>
    </div>
  );
}