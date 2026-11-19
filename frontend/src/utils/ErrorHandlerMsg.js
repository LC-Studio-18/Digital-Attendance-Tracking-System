export function handleApiError(error) {
  // Check for network connection issues
  if (
    !navigator.onLine ||
    error?.message?.includes('Failed to fetch') ||
    error?.name === 'TypeError'
  ) {
    return {
      message: 'Network connection lost. Please check your internet connection and try again.',
      isUnauthorized: false,
      type: 'network',
    };
  }

  switch (error?.status) {
    case 400:
      return {
        message: 'Invalid request. Please check your information and try again.',
        isUnauthorized: false,
        type: 'api',
      };
    case 401:
      return {
        message: 'Your session has expired. Please log back in to continue.',
        isUnauthorized: true,
        type: 'unauthorized',
      };
    case 403:
      return {
        message: 'Access denied. You do not have permission to perform this action.',
        isUnauthorized: false,
        type: 'api',
      };
    case 409:
      return {
        message: 'Conflict detected. This record may already exist or conflict with current data.',
        isUnauthorized: false,
        type: 'api',
      };
    case 500:
      return {
        message: 'Server error. Something went wrong on our end—please try again later.',
        isUnauthorized: false,
        type: 'api',
      };
    default:
      return {
        message: error?.message || 'An unexpected error occurred. Please try again.',
        isUnauthorized: false,
        type: 'api',
      };
  }
}