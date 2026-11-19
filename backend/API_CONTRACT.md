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

### 503 Service Unavailable — Firebase or Sheets not configured (staging/config issue)

```json
{
  "success": false,
  "message": "Firebase is not configured"
}
```

## Notes for frontend team

- `timestamp` is always generated server-side — don't send one, it'll be ignored.
- `locationId` must exactly match what the server expects (ask backend team for the real value once Firebase/Sheets are confirmed live on staging).
- A user can only check in once per calendar day — a second attempt on the same day returns 409.
