
import { useEffect, useState } from 'react';
import './ClockOutPage.css';
import ClockOut from '../components/Clockout/Clockout';

function ClockIcon() {
  return (
    <span className="clock-icon" aria-hidden="true">
      <span className="clock-icon__face">
        <span className="clock-icon__hand" />
      </span>
    </span>
  );
}

// Displays the employee's current attendance status and clock-out information
function AttendanceStatus({ clockedout, clockoutTime }) {
  return (
    <aside className="attendance-status" aria-live="polite">
      <span className="attendance-status__badge">
        {clockedout ? 'Clocked Out' : 'Clocked In'}   {/*if Clockedout display clockedout else display clocked in*/}
      </span>

      <p className="attendance-status__headline">
        {clockedout
          ? `You clocked out at ${clockoutTime}`   /* If clockedout is true, display the clockoutTime value passed down through props. */
          : "You haven't clocked out yet"}
      </p>

      <p className="attendance-status__description">
        Since 8:40  
      </p> 
      {/* The real time clocked in will be added later using the API */}
    </aside>
  );
}

export default function ClockoutPage() {
  const [now, setNow] = useState(() => new Date()); // Will be used to get the current date, day and time
  const [clockedout, setClockedout] = useState(false);  
  const [clockoutTime, setClockoutTime] = useState('');

  useEffect(() => {  // Updates the displayed time every 30 seconds
    const timer = window.setInterval(
      () => setNow(new Date()),
      30000 //execute after every 30000 milliseconds
    );

    return () => window.clearInterval(timer); 
  }, []);


  // functions to format the time 
  const dateLabel = new Intl.DateTimeFormat('en-ZA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  const timeLabel = new Intl.DateTimeFormat('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(now).toUpperCase();

  const greeting =
    now.getHours() < 12
      ? 'Good Morning!'
      : now.getHours() < 18
        ? 'Good Afternoon!'
        : 'Good Evening!';

  function handleClockout() {
    if (clockedout) return;

    const currentTime = new Intl.DateTimeFormat('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date()).toUpperCase();

    setClockoutTime(currentTime);
    setClockedout(true);   // Sets clockout to true
  }

  return (
    <main className="clock-in-page">

      <header className="topbar">
        <a className="topbar__brand" href="#home">
          LC Studio
        </a>
        <span className="topbar__subtitle">
          Digital Attendance
        </span>
      </header>

      <section className="clock-in-content">

        <div className="welcome-panel">

          <div className="welcome-panel__identity">
            <ClockIcon />
            
            <div className="welcome-copy">
              <p className="welcome-copy__greeting">
                {greeting}
              </p>

              <h1>Welcome, <span clockout-h1>{'{Employee}'}</span></h1>

              <p className="welcome-copy__datetime">
                {dateLabel} • {timeLabel} 
              </p>
            </div>
          </div>

          {/* Passes attendance information to the AttendanceStatus component*/}
          <AttendanceStatus clockedout={clockedout} clockoutTime={clockoutTime}/>
        </div>

        <div className="clock-action">

          {/*Passes the clock-out handler and disabled state to the ClockOut component*/}
          <ClockOut onClockOut={handleClockout} disabled={clockedout}/>

          <p className="location-notice">
            Your Live Location is being recorded, please reach out to your supervisor for more
            information
          </p>

        </div>

      </section>
    </main>
  );
}

