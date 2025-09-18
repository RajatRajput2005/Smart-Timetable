import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Smart Timetable",
  description: "NEP 2020 AI Engine",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        {/* Navbar */}
        <header className="navbar">
          {/* Left: Logo */}
          <div className="navbar-left">
            <div className="logo">ST</div>
            <div>
              <h1>Smart Timetable</h1>
              <p>NEP 2020 AI Engine</p>
            </div>
          </div>

          {/* Middle: Search Bar */}
          <div className="navbar-center">
            <input
              type="text"
              placeholder="🔍 Search timetables, faculty, rooms..."
            />
          </div>

          {/* Right: Actions */}
          <div className="navbar-right">
            <button id="theme-toggle">🌙</button>
            <button>🔔</button>
            <div className="profile">
              <span>👤</span>
              <div className="profile-menu">
                <Link href="/">Dashboard</Link>
                <Link href="/teachers">Faculty</Link>
                <Link href="/rooms">Rooms</Link>
                <a href="#">Logout</a>
              </div>
            </div>
          </div>
        </header>

        {/* Layout */}
        <div className="container">
          <aside>
            <h3>Navigation</h3>
            <nav>
              <Link href="/">Dashboard</Link>
              <Link href="/timetable">New Timetable</Link>
              <Link href="/all-timetables">All Timetables</Link>
              <Link href="/edit-timetable">Edit Timetable</Link>
              <Link href="/teachers">Faculty</Link>
              <Link href="/rooms">Rooms</Link>
              <Link href="/timeslots">Time Slots</Link>
              <Link href="/export">Export</Link>
            </nav>
          </aside>

          <main>{children}</main>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-container">
            {/* About Section */}
            <div className="footer-section">
              <h3>Smart Timetable</h3>
              <p>
                AI-powered timetable generator to manage lectures, labs,
                sports, and extracurriculars without conflicts.
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link href="/">Dashboard</Link></li>
                <li><Link href="/timetable">New Timetable</Link></li>
                <li><Link href="/all-timetables">All Timetables</Link></li>
                <li><Link href="/teachers">Faculty</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h4>Contact</h4>
              <p>📍 Greater Noida, India</p>
              <p>📞 +91 98765 43210</p>
              <p>✉️ support@smarttimetable.com</p>
            </div>

            {/* Social Media */}
            <div className="footer-section">
              <h4>Follow Us</h4>
              <div className="social-icons">
                <a href="https://facebook.com" target="_blank">📘 Facebook</a>
                <a href="https://instagram.com" target="_blank">📸 Instagram</a>
                <a href="https://linkedin.com" target="_blank">💼 LinkedIn</a>
                <a href="https://twitter.com" target="_blank">🐦 Twitter</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>⚡ No Copyright – Use Freely | Made with ❤️ for SIH </p>
          </div>
        </footer>

        {/* Theme Toggle Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener("DOMContentLoaded", () => {
                const toggle = document.getElementById("theme-toggle");
                toggle.addEventListener("click", () => {
                  document.body.classList.toggle("light");
                  toggle.textContent = document.body.classList.contains("light") ? "🌞" : "🌙";
                });
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
