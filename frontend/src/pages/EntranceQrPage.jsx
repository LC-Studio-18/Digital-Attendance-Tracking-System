import EntranceQrDisplay from '../components/EntranceQrDisplay';

const DEFAULT_ENTRANCE_PAYLOAD =
  import.meta.env.VITE_ENTRANCE_LOCATION_ID || 'test-location-001';

export default function EntranceQrPage() {
  return (
    <main className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light p-4">
      <div className="text-center mb-4">
        <span className="badge rounded-pill text-bg-dark px-3 py-2 mb-2">
          LC Attends
        </span>
        <h1 className="h3 fw-bold text-dark mb-1">Entrance Check-In</h1>
        <p className="text-secondary small mb-0">
          Life Choices Lansdowne • Live Attendance Point
        </p>
      </div>

      <EntranceQrDisplay
        payload={DEFAULT_ENTRANCE_PAYLOAD}
        locationLabel="Life Choices Lansdowne"
      />
    </main>
  );
}