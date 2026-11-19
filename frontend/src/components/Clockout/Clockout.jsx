
function ClockOut({ onClockOut, disabled }) {  // Receives the clock-out function and disabled state from ClockoutPage.jsx
  return (
    <button className="clock-action__button" onClick={onClockOut} disabled={disabled} type="button">  {/*Calls the clockout function when the button is clicked*/}
      <span className="clock-action__play" aria-hidden="true" />
      {disabled ? 'Clocked Out' : 'Clock Out'}  {/*changes the text depending on the users status*/}
    </button>
  );
}

export default ClockOut;  

