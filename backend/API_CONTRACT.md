# API Contract — QR Check-in

## Endpoint

POST /api/attendance/qr-checkin

## Headers

| Header          | Required | Example                  |
|------------------|----------|---------------------------|
| Authorization    | Yes      | `Bearer <firebase-id-token>` |
| Content-Type     | Yes      | `application/json`        |

## Request Body

```json
{
  "locationId": "string"
}
```

| Field       | Type   | Required | Notes                                  |
|--------------|--------|----------|------------------------------------------|
| locationId  | string | Yes      | Must match the building's expected ID    |

## Responses

### 200 OK — Success

```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "timestamp": "2026-11-17T13:00:00.000Z",
    "userId": "firebase-uid-here"
  }
}
```

### 400 Bad Request — Missing/invalid body, or malformed JSON

```json
{
  "success": false,
  "message": "Invalid QR code or unknown location"
}
```

### 401 Unauthorized — Missing or invalid Firebase token

```json
{
  "success": false,
  "message": "Missing or invalid Authorization header"
}
```
or
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 409 Conflict — Already checked in today

```json
{
  "success": false,
  "message": "Already checked in today"
}
```

### 502 Bad Gateway — Google Sheets write failed

```json
{
  "success": false,
  "message": "Google Sheets request failed"
}
```

### 503 Service Unavailable — Google Sheets not configured

```json
{
  "success": false,
  "message": "Google Sheets is not configured"
}
```

## Notes for frontend team

- `timestamp` is always generated server-side — don't send one, it'll be ignored.
- `locationId` must exactly match one of the comma-separated IDs in `VALID_LOCATION_IDS`.
- A user can only check in once per calendar day — a second attempt on the same day returns 409.

# API Contract — Employee Dashboard

## Endpoint

GET /api/attendance/me/dashboard

## Headers

| Header       | Required | Example                  |
|--------------|----------|---------------------------|
| Authorization | Yes      | `Bearer <firebase-id-token>` |

The employee record is selected only by the UID from the verified Firebase token.

## Responses

### 200 OK — Success

```json
{
  "success": true,
  "data": {
    "name": "Test User",
    "status": "Present",
    "lastClockIn": "2026-11-19T08:00:00.000Z",
    "lastClockOut": null,
    "history": [
      {
        "timestamp": "2026-11-19T08:00:00.000Z",
        "status": "Present"
      }
    ]
  }
}
```

### 401 Unauthorized — Missing or invalid Firebase token

```json
{
  "success": false,
  "message": "Missing or invalid Authorization header"
}
```

or

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden — Employee is inactive

```json
{
  "success": false,
  "message": "Employee is not active"
}
```

### 404 Not Found — Employee record does not exist

```json
{
  "success": false,
  "message": "Employee record not found"
}
```

### 503 Service Unavailable — Firebase authentication is not configured

```json
{
  "success": false,
  "message": "Firebase is not configured"
}
```

Other unexpected errors are handled by the central error handler and return its `err.status` if set, otherwise `500`, with this response shape:

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```
