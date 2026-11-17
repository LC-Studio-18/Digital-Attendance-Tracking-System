import StatusCard from "../components/StatusCard";

function ClockOutPage() {
  const employeeName = "Employee"; // real name comes from the API later
  const clockedInSince = "2026-11-14T08:15:00"; // real time comes from the API later

  return (
    <div>
      <header>
        <strong>LC Studio</strong> <small>Digital Attendance</small>
      </header>

      <main>
        <section>
          <p>Good afternoon!</p>
          <h1>Welcome, {employeeName}</h1>
          <p>Saturday, 14 November 2026</p>
        </section>

        <StatusCard status="in" since={clockedInSince} />

        <button>Clock Out</button>
        <p>Your attendance is active</p>
      </main>
    </div>
  );
}

export default ClockOutPage;