
import { clockOutEmployee } from '../services/attendanceService.js';

// Handles incoming employee clock-out requests.
export function clockOut(req, res, next) {
  try {
    // Get the Firebase UID attached to the request by the authentication middleware.
    // Pass it to the service to process the employee's clock-out.
    const result = clockOutEmployee(req.user.uid);

    // Return a successful response with the employee's attendance information.
    return res.status(200).json({
      success: true,
      message: 'Clocked out successfully.',
      data: result,
    });
  } catch (error) {
    // Pass errors to the central Express error handler.
    next(error);
  }
}
