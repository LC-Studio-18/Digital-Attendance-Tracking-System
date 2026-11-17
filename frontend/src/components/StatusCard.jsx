function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function StatusCard({ status, since }) {
  if (status === "loading") {
    return <div className="status-card">Loading...</div>;
  }

  if (status === "error") {
    return (
      <div className="status-card">
        <strong>Status unavailable</strong>
        <p>We couldn't load your status</p>
      </div>
    );
  }

  if (status === "in") {
    return (
      <div className="status-card">
        <strong>Clocked In</strong>
        <p>You are currently clocked in</p>
        {since && <p>Since {formatTime(since)}</p>}
      </div>
    );
  }

  return (
    <div className="status-card">
      <strong>Clocked Out</strong>
      <p>You haven't clocked in yet</p>
      <p>Your attendance hasn't been recorded for today</p>
    </div>
  );
}

export default StatusCard;