import { useState } from 'react';
import { handleApiError } from '../utils/ErrorHandlerMsg';

export default function CorrectionModal({ record, onClose, onSave }) {
  const [newClockIn, setNewClockIn] = useState(record?.clockIn || '');
  const [newClockOut, setNewClockOut] = useState(record?.clockOut || '');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = reason.trim().length > 0 && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError('');

    try {
      // 1. Grab the auth token from localStorage to verify admin permissions
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;

      const payload = {
        ...(record || {}),
        clockIn: newClockIn,
        clockOut: newClockOut,
        reason: reason.trim()
      };

      // 2. Send the PUT request to the backend endpoint with the token header
      const response = await fetch(`${apiUrl}/api/attendance/correct`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = new Error('Failed to save correction');
        err.status = response.status;
        throw err;
      }

      if (onSave) onSave(payload);
      onClose();
    } catch (err) {
      // 3. Catch errors using your standard error handler utility
      const handled = handleApiError(err);
      setError(handled.message);

      if (handled.isUnauthorized) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        
        {/* Modal Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#111' }}>Correct Attendance</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            Staff: <strong style={{ color: '#333' }}>{record?.employeeName || 'Staff Member'}</strong> &bull; Date: {record?.date || 'Today'}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={errorBannerStyle}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Clock-In Time</label>
              <input 
                type="time" 
                value={newClockIn} 
                onChange={(e) => setNewClockIn(e.target.value)} 
                disabled={loading}
                style={inputStyle} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Clock-Out Time</label>
              <input 
                type="time" 
                value={newClockOut} 
                onChange={(e) => setNewClockOut(e.target.value)} 
                disabled={loading}
                style={inputStyle} 
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Reason for Correction (Required)</label>
            <textarea 
              placeholder="Provide a clear explanation for this correction..." 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              rows="3" 
              disabled={loading}
              style={{ ...inputStyle, resize: 'vertical' }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} disabled={loading} style={cancelButtonStyle}>
              Cancel
            </button>
            <button type="submit" disabled={!isValid} style={isValid ? submitButtonStyle : disabledButtonStyle}>
              {loading ? 'Saving...' : 'Confirm Correction'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 1000, backdropFilter: 'blur(2px)'
};

const modalContentStyle = {
  background: '#fff', padding: '2rem', borderRadius: '12px', width: '440px', maxWidth: '90%', 
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: '1px solid #eaeaea', fontFamily: 'Inter, sans-serif'
};

const errorBannerStyle = {
  padding: '10px 12px', background: '#fce8e6', color: '#c5221f', border: '1px solid #f6aea9',
  borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: '500'
};

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#444', marginBottom: '6px' };

const inputStyle = { 
  width: '100%', 
  padding: '10px 12px', 
  borderRadius: '6px', 
  border: '1px solid #ccc', 
  fontSize: '0.95rem', 
  outline: 'none', 
  background: '#ffffff', // Changed from #fafafa to solid white
  color: '#202124',      // Ensures typed/prefilled numbers are dark and clear
  boxSizing: 'border-box' 
};

const cancelButtonStyle = { flex: 1, padding: '10px', background: '#f1f3f4', color: '#333', border: '1px solid #dcdcdc', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' };

const submitButtonStyle = { flex: 1, padding: '10px', background: '#202124', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' };

const disabledButtonStyle = { flex: 1, padding: '10px', background: '#e0e0e0', color: '#999', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'not-allowed', fontSize: '0.95rem' };