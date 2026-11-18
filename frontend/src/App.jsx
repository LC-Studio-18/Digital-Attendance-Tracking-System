import { useState, useEffect } from 'react';
import CorrectionModal from './components/CorrectionModal';
import { handleApiError } from './utils/errorHandler';

export default function App() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch real attendance records from the backend when the page loads
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL;

        const response = await fetch(`${apiUrl}/api/attendance`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const err = new Error('Failed to fetch attendance records');
          err.status = response.status;
          throw err;
        }

        const data = await response.json();
        setAttendanceRecords(data);
      } catch (err) {
        const handled = handleApiError(err);
        setError(handled.message);
        if (handled.isUnauthorized) {
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Updates the specific row locally after a successful correction
  const handleSaveSuccess = (updatedRecord) => {
    setAttendanceRecords((prev) =>
      prev.map((item) => (item.id === updatedRecord.id ? updatedRecord : item))
    );
    setSelectedRecord(null);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading attendance records...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <h2>Staff Attendance Records</h2>

      {error && (
        <div style={errorBannerStyle}>
          {error}
        </div>
      )}

      {attendanceRecords.length === 0 && !error ? (
        <p style={{ color: '#666', marginTop: '1rem' }}>No attendance records found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ background: '#f1f3f4', textAlign: 'left' }}>
              <th style={thStyle}>Staff Member</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Clock-In</th>
              <th style={thStyle}>Clock-Out</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((record) => (
              <tr key={record.id || record._id} style={{ borderBottom: '1px solid #eaeaea' }}>
                <td style={tdStyle}>{record.employeeName}</td>
                <td style={tdStyle}>{record.date}</td>
                <td style={tdStyle}>{record.clockIn}</td>
                <td style={tdStyle}>{record.clockOut}</td>
                <td style={tdStyle}>
                  <button 
                    onClick={() => setSelectedRecord(record)} 
                    style={correctButtonStyle}
                  >
                    Correct
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedRecord && (
        <CorrectionModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onSave={handleSaveSuccess}
        />
      )}
    </div>
  );
}

const thStyle = { padding: '12px', fontSize: '0.85rem', color: '#444', fontWeight: '600' };
const tdStyle = { padding: '12px', fontSize: '0.9rem', color: '#333' };
const correctButtonStyle = { 
  padding: '6px 12px', 
  background: '#202124', 
  color: '#fff', 
  border: 'none', 
  borderRadius: '4px', 
  fontWeight: '500', 
  cursor: 'pointer',
  fontSize: '0.85rem'
};

const errorBannerStyle = {
  padding: '10px 12px', background: '#fce8e6', color: '#c5221f', border: '1px solid #f6aea9',
  borderRadius: '6px', fontSize: '0.85rem', marginTop: '1rem', fontWeight: '500'
};