import { useState } from "react";
import './Clockout.css';

function ClockOut() {
    const[Clockout, setClockout] = useState('Clockin');
    const[loading, setloading] = useState(false);

    function handleClockout() {
        setloading(true);

        setTimeout(() => {
            setloading(false)

            Clockout === 'Clockin' ? 'Clockout' : 'Clockin'
        }, 2000)
    }
    
    return (
        <>
        <button className="ClockOut-btn" onClick={handleClockout} disabled={loading}>{loading ? 'Processing...' : 'Clockout'}</button>
        </>
    )
};

export default ClockOut;