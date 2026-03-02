# API Testing Routes Documentation

**Base URL:** `http://localhost:5000/api/v1`

**API Version:** v1

**Last Updated:** March 2, 2026

---

## Table of Contents
1. [Health Check](#health-check)
2. [Users Module](#users-module)
3. [Vehicles Module](#vehicles-module)
4. [Telemetry Module](#telemetry-module)
5. [Health Predictions Module](#health-predictions-module)
6. [Alerts Module](#alerts-module)
7. [Recommendations Module](#recommendations-module)
8. [Model Metadata Module](#model-metadata-module)

---

## Health Check

### GET - Health Status
- **Route:** `GET /health`
- **Full URL:** `http://localhost:5000/health`
- **Description:** Check if the API server is running
- **Authentication Required:** No
- **Request Headers:** None

**Response (200 OK):**
```json
{
  "app": "Vehixa",
  "status": "ok",
  "time": "2026-03-02T10:30:45.123Z"
}
```

**Status Codes:**
- `200 OK` - Server is running

---

## Users Module

Base path: `/users`

### POST - Register User
- **Route:** `POST /users/register`
- **Full URL:** `http://localhost:5000/api/v1/users/register`
- **Description:** Create a new user account
- **Authentication Required:** No

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role": "USER"
}
```

**Request Body Schema:**
- `name` (string, required): Minimum 2 characters
- `email` (string, required): Valid email format
- `password` (string, required): Minimum 8 characters
- `role` (enum, optional): USER, ADMIN, TECHNICIAN (defaults to USER)

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "USER",
    "createdAt": "2026-03-02T10:30:45.123Z"
  }
}
```

**Status Codes:**
- `201 Created` - User created successfully
- `400 Bad Request` - Invalid input data
- `409 Conflict` - Email already exists
- `500 Internal Server Error` - Database error

---

### POST - Login User
- **Route:** `POST /users/login`
- **Full URL:** `http://localhost:5000/api/v1/users/login`
- **Description:** Authenticate user and receive JWT token
- **Authentication Required:** No

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Request Body Schema:**
- `email` (string, required): Valid email format
- `password` (string, required): Minimum 1 character

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "USER"
  }
}
```

**Status Codes:**
- `200 OK` - Login successful
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Database error

---

### GET - Get Current User Profile
- **Route:** `GET /users/me`
- **Full URL:** `http://localhost:5000/api/v1/users/me`
- **Description:** Get authenticated user's profile information
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "USER",
  "createdAt": "2026-03-02T10:30:45.123Z",
  "updatedAt": "2026-03-02T10:30:45.123Z"
}
```

**Status Codes:**
- `200 OK` - Profile retrieved
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - User not found
- `500 Internal Server Error` - Database error

---

### GET - List All Users
- **Route:** `GET /users`
- **Full URL:** `http://localhost:5000/api/v1/users`
- **Description:** Get list of all users (Admin only)
- **Authentication Required:** Yes (JWT Token with ADMIN role)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "USER",
      "createdAt": "2026-03-02T10:30:45.123Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN",
      "createdAt": "2026-03-02T10:30:45.123Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - List retrieved
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions (not admin)
- `500 Internal Server Error` - Database error

---

## Vehicles Module

Base path: `/vehicles`

### POST - Create Vehicle
- **Route:** `POST /vehicles`
- **Full URL:** `http://localhost:5000/api/v1/vehicles`
- **Description:** Register a new vehicle for authenticated user
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "vehicleNumber": "DL-01-AB-1234",
  "model": "Model S",
  "manufacturer": "Tesla",
  "year": 2023,
  "vehicleType": "SEDAN",
  "vin": "WVWZZZ3CZ2E123456",
  "engineType": "ELECTRIC",
  "fuelType": "ELECTRIC",
  "registrationDate": "2023-01-15",
  "status": "ACTIVE"
}
```

**Request Body Schema:**
- `userId` (string UUID, required): User ID
- `vehicleNumber` (string, optional): Vehicle registration number, min 3 chars
- `model` (string, optional): Vehicle model name
- `manufacturer` (string, optional): Manufacturer name
- `year` (number, optional): Year of manufacture, between 1980-2100
- `vehicleType` (enum, optional): SEDAN, SUV, TRUCK, VAN, MOTORCYCLE, etc.
- `vin` (string, optional): Vehicle Identification Number, 8-32 characters
- `engineType` (enum, optional): PETROL, DIESEL, HYBRID, ELECTRIC, CNG, LPG
- `fuelType` (enum, required): PETROL, DIESEL, HYBRID, ELECTRIC, CNG, LPG
- `registrationDate` (date, optional): Registration date
- `status` (enum, optional): ACTIVE, MAINTENANCE, INACTIVE, DECOMMISSIONED

**Response (201 Created):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "vehicleNumber": "DL-01-AB-1234",
  "model": "Model S",
  "manufacturer": "Tesla",
  "year": 2023,
  "vehicleType": "SEDAN",
  "vin": "WVWZZZ3CZ2E123456",
  "engineType": "ELECTRIC",
  "fuelType": "ELECTRIC",
  "registrationDate": "2023-01-15",
  "status": "ACTIVE",
  "currentHealth": 85,
  "createdAt": "2026-03-02T10:30:45.123Z"
}
```

**Status Codes:**
- `201 Created` - Vehicle created successfully
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Database error

---

### GET - List All Vehicles
- **Route:** `GET /vehicles`
- **Full URL:** `http://localhost:5000/api/v1/vehicles`
- **Description:** Get list of all vehicles for authenticated user
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Query Parameters:**
- `status` (optional): Filter by status (ACTIVE, INACTIVE, MAINTENANCE)
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Example URL:**
```
http://localhost:5000/api/v1/vehicles?status=ACTIVE&limit=10&offset=0
```

**Response (200 OK):**
```json
{
  "vehicles": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "vehicleNumber": "DL-01-AB-1234",
      "model": "Model S",
      "manufacturer": "Tesla",
      "year": 2023,
      "vehicleType": "SEDAN",
      "vin": "WVWZZZ3CZ2E123456",
      "engineType": "ELECTRIC",
      "fuelType": "ELECTRIC",
      "status": "ACTIVE",
      "currentHealth": 85,
      "createdAt": "2026-03-02T10:30:45.123Z"
    }
  ],
  "total": 1
}
```

**Status Codes:**
- `200 OK` - List retrieved
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Database error

---

### GET - Get Vehicle Details
- **Route:** `GET /vehicles/:vehicleId`
- **Full URL:** `http://localhost:5000/api/v1/vehicles/660e8400-e29b-41d4-a716-446655440000`
- **Description:** Get detailed information about a specific vehicle
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**URL Parameters:**
- `vehicleId` (string UUID, required): Vehicle ID

**Response (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "vehicleNumber": "DL-01-AB-1234",
  "model": "Model S",
  "manufacturer": "Tesla",
  "year": 2023,
  "vehicleType": "SEDAN",
  "vin": "WVWZZZ3CZ2E123456",
  "engineType": "ELECTRIC",
  "fuelType": "ELECTRIC",
  "registrationDate": "2023-01-15",
  "status": "ACTIVE",
  "currentHealth": 85,
  "createdAt": "2026-03-02T10:30:45.123Z",
  "updatedAt": "2026-03-02T10:30:45.123Z"
}
```

**Status Codes:**
- `200 OK` - Vehicle details retrieved
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Vehicle not found
- `500 Internal Server Error` - Database error

---

### PATCH - Update Vehicle
- **Route:** `PATCH /vehicles/:vehicleId`
- **Full URL:** `http://localhost:5000/api/v1/vehicles/660e8400-e29b-41d4-a716-446655440000`
- **Description:** Update vehicle information (all fields optional)
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "vehicleNumber": "DL-01-AB-5678",
  "status": "MAINTENANCE",
  "model": "Model 3"
}
```

**Response (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "vehicleNumber": "DL-01-AB-5678",
  "model": "Model 3",
  "manufacturer": "Tesla",
  "year": 2023,
  "vehicleType": "SEDAN",
  "vin": "WVWZZZ3CZ2E123456",
  "engineType": "ELECTRIC",
  "fuelType": "ELECTRIC",
  "status": "MAINTENANCE",
  "currentHealth": 85,
  "updatedAt": "2026-03-02T10:35:00.123Z"
}
```

**Status Codes:**
- `200 OK` - Vehicle updated successfully
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Vehicle not found
- `500 Internal Server Error` - Database error

---

### DELETE - Delete Vehicle
- **Route:** `DELETE /vehicles/:vehicleId`
- **Full URL:** `http://localhost:5000/api/v1/vehicles/660e8400-e29b-41d4-a716-446655440000`
- **Description:** Delete a vehicle record
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**URL Parameters:**
- `vehicleId` (string UUID, required): Vehicle ID

**Response (200 OK):**
```json
{
  "message": "Vehicle deleted successfully",
  "vehicleId": "660e8400-e29b-41d4-a716-446655440000"
}
```

**Status Codes:**
- `200 OK` - Vehicle deleted successfully
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Vehicle not found
- `500 Internal Server Error` - Database error

---

## Telemetry Module

Base path: `/telemetry`

### POST - Ingest Telemetry Data
- **Route:** `POST /telemetry`
- **Full URL:** `http://localhost:5000/api/v1/telemetry`
- **Description:** Submit vehicle telemetry/sensor data
- **Authentication Required:** Optional (requires API Key OR JWT Token)

**Request Headers:**
```
Content-Type: application/json
X-API-Key: vehicle-api-key-123 OR Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "vehicleId": "660e8400-e29b-41d4-a716-446655440000",
  "source": "OBD2",
  "engineTemp": 94.5,
  "batteryVoltage": 12.6,
  "rpm": 2500,
  "oilPressure": 45.2,
  "mileage": 42850,
  "vibrationLevel": 0.3,
  "fuelEfficiency": 8.5,
  "errorCodesCount": 0,
  "ambientTemperature": 28.5,
  "coolantLevel": 95,
  "recordedAt": "2026-03-02T10:30:45.123Z"
}
```

**Request Body Schema:**
- `vehicleId` (string UUID, required): Vehicle ID
- `source` (enum, optional): OBD2, CAN_BUS, TELEMATICS, MANUAL
- `engineTemp` (number, optional): Engine temperature in Celsius
- `batteryVoltage` (number, optional): Battery voltage in Volts
- `rpm` (integer, optional): Engine RPM
- `oilPressure` (number, optional): Oil pressure in PSI
- `mileage` (number, optional): Vehicle mileage in km
- `vibrationLevel` (number, optional): Vibration level 0-10
- `fuelEfficiency` (number, optional): Fuel efficiency in km/l
- `errorCodesCount` (integer, optional): Number of error codes
- `ambientTemperature` (number, optional): Ambient temperature in Celsius
- `coolantLevel` (number, optional): Coolant level percentage 0-100
- `recordedAt` (date, required): Timestamp when data was recorded

**Response (201 Created):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "vehicleId": "660e8400-e29b-41d4-a716-446655440000",
  "source": "OBD2",
  "engineTemp": 94.5,
  "batteryVoltage": 12.6,
  "rpm": 2500,
  "oilPressure": 45.2,
  "mileage": 42850,
  "vibrationLevel": 0.3,
  "fuelEfficiency": 8.5,
  "errorCodesCount": 0,
  "ambientTemperature": 28.5,
  "coolantLevel": 95,
  "recordedAt": "2026-03-02T10:30:45.123Z",
  "createdAt": "2026-03-02T10:30:45.123Z"
}
```

**Status Codes:**
- `201 Created` - Telemetry data ingested successfully
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Invalid API key or token
- `500 Internal Server Error` - Database error

---

### GET - List Telemetry Data
- **Route:** `GET /telemetry`
- **Full URL:** `http://localhost:5000/api/v1/telemetry`
- **Description:** Get list of telemetry records
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Query Parameters:**
- `vehicleId` (optional): Filter by vehicle ID
- `startDate` (optional): Filter from date (ISO 8601 format)
- `endDate` (optional): Filter to date (ISO 8601 format)
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Example URL:**
```
http://localhost:5000/api/v1/telemetry?vehicleId=660e8400-e29b-41d4-a716-446655440000&limit=10
```

**Response (200 OK):**
```json
{
  "telemetry": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "vehicleId": "660e8400-e29b-41d4-a716-446655440000",
      "source": "OBD2",
      "engineTemp": 94.5,
      "batteryVoltage": 12.6,
      "rpm": 2500,
      "mileage": 42850,
      "recordedAt": "2026-03-02T10:30:45.123Z"
    }
  ],
  "total": 1
}
```

**Status Codes:**
- `200 OK` - List retrieved
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Database error

---

### GET - Get Telemetry Record
- **Route:** `GET /telemetry/:telemetryId`
- **Full URL:** `http://localhost:5000/api/v1/telemetry/770e8400-e29b-41d4-a716-446655440000`
- **Description:** Get detailed telemetry record
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**URL Parameters:**
- `telemetryId` (string UUID, required): Telemetry record ID

**Response (200 OK):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "vehicleId": "660e8400-e29b-41d4-a716-446655440000",
  "source": "OBD2",
  "engineTemp": 94.5,
  "batteryVoltage": 12.6,
  "rpm": 2500,
  "oilPressure": 45.2,
  "mileage": 42850,
  "vibrationLevel": 0.3,
  "fuelEfficiency": 8.5,
  "errorCodesCount": 0,
  "ambientTemperature": 28.5,
  "coolantLevel": 95,
  "recordedAt": "2026-03-02T10:30:45.123Z"
}
```

**Status Codes:**
- `200 OK` - Record retrieved
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Telemetry record not found
- `500 Internal Server Error` - Database error

---

## Health Predictions Module

Base path: `/health-predictions`

### POST - Live Health Evaluation
- **Route:** `POST /health-predictions/evaluate`
- **Full URL:** `http://localhost:5000/api/v1/health-predictions/evaluate`
- **Description:** Evaluate vehicle health in real-time using ML model with manual telemetry input
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "engineTemp": 94.5,
  "batteryVoltage": 12.6,
  "rpm": 2500,
  "oilPressure": 45.2,
  "mileage": 42850,
  "vibrationLevel": 0.3,
  "fuelEfficiency": 8.5,
  "ambientTemperature": 28.5,
  "coolantLevel": 95,
  "errorCodesCount": 0
}
```

**Request Body Schema (all fields optional):**
- `engineTemp` (number): Engine temperature in Celsius
- `batteryVoltage` (number): Battery voltage in Volts
- `rpm` (integer): Engine RPM
- `oilPressure` (number): Oil pressure in PSI
- `mileage` (number): Vehicle mileage in km
- `vibrationLevel` (number): Vibration level 0-10
- `fuelEfficiency` (number): Fuel efficiency in km/l
- `ambientTemperature` (number): Ambient temperature in Celsius
- `coolantLevel` (number): Coolant level percentage 0-100
- `errorCodesCount` (integer): Number of error codes

**Response (200 OK):**
```json
{
  "overallHealth": 85.5,
  "riskLevel": "LOW",
  "status": "HEALTHY",
  "failureProbability": 0.145,
  "confidenceScore": 0.92,
  "predictedFailureDays": 38,
  "modelVersion": "vehixa-heuristic-v1",
  "components": {
    "engine": 88,
    "transmission": 95,
    "battery": 85,
    "cooling": 90,
    "suspension": 92
  },
  "recommendations": [
    "Vehicle in good condition"
  ]
}
```

**Status Codes:**
- `200 OK` - Evaluation completed successfully
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - ML model error

---

### GET - List Health Predictions
- **Route:** `GET /health-predictions`
- **Full URL:** `http://localhost:5000/api/v1/health-predictions`
- **Description:** Get list of vehicle health predictions
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Query Parameters:**
- `vehicleId` (optional): Filter by vehicle ID
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Example URL:**
```
http://localhost:5000/api/v1/health-predictions?vehicleId=660e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
{
  "predictions": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "vehicleId": "660e8400-e29b-41d4-a716-446655440000",
      "overallHealth": 85,
      "riskLevel": "LOW",
      "timestamp": "2026-03-02T10:30:45.123Z",
      "components": {
        "engine": 88,
        "transmission": 82,
        "battery": 85,
        "suspension": 80,
        "brakes": 78
      },
      "predictedServiceDate": "2026-04-02"
    }
  ],
  "total": 1
}
```

**Status Codes:**
- `200 OK` - List retrieved
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Database error

---

### GET - Get Specific Health Prediction
- **Route:** `GET /health-predictions/:predictionId`
- **Full URL:** `http://localhost:5000/api/v1/health-predictions/880e8400-e29b-41d4-a716-446655440000`
- **Description:** Get detailed health prediction
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**URL Parameters:**
- `predictionId` (string UUID, required): Prediction ID

**Response (200 OK):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "vehicleId": "660e8400-e29b-41d4-a716-446655440000",
  "overallHealth": 85,
  "riskLevel": "LOW",
  "timestamp": "2026-03-02T10:30:45.123Z",
  "components": {
    "engine": 88,
    "transmission": 82,
    "battery": 85,
    "suspension": 80,
    "brakes": 78
  },
  "predictedServiceDate": "2026-04-02",
  "createdAt": "2026-03-02T10:30:45.123Z"
}
```

**Status Codes:**
- `200 OK` - Prediction retrieved
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Prediction not found
- `500 Internal Server Error` - Database error

---

## Alerts Module

Base path: `/alerts`

### GET - List Vehicle Alerts
- **Route:** `GET /alerts`
- **Full URL:** `http://localhost:5000/api/v1/alerts`
- **Description:** Get list of vehicle alerts
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Query Parameters:**
- `vehicleId` (optional): Filter by vehicle ID
- `severity` (optional): Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
- `resolved` (optional): Filter by resolved status (true/false)
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Example URL:**
```
http://localhost:5000/api/v1/alerts?vehicleId=660e8400-e29b-41d4-a716-446655440000&severity=HIGH
```

**Response (200 OK):**
```json
{
  "alerts": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440000",
      "vehicleId": "660e8400-e29b-41d4-a716-446655440000",
      "type": "error",
      "severity": "HIGH",
      "title": "Engine Temperature Critical",
      "description": "Engine temperature exceeded 110°C. Immediate cooldown required.",
      "isResolved": false,
      "createdAt": "2026-03-02T10:30:45.123Z"
    }
  ],
  "total": 1
}
```

**Status Codes:**
- `200 OK` - List retrieved
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Database error

---

### GET - Get Specific Alert
- **Route:** `GET /alerts/:alertId`
- **Full URL:** `http://localhost:5000/api/v1/alerts/990e8400-e29b-41d4-a716-446655440000`
- **Description:** Get detailed alert information
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**URL Parameters:**
- `alertId` (string UUID, required): Alert ID

**Response (200 OK):**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "vehicleId": "660e8400-e29b-41d4-a716-446655440000",
  "type": "error",
  "severity": "HIGH",
  "title": "Engine Temperature Critical",
  "description": "Engine temperature exceeded 110°C. Immediate cooldown required.",
  "isResolved": false,
  "createdAt": "2026-03-02T10:30:45.123Z",
  "resolvedAt": null
}
```

**Status Codes:**
- `200 OK` - Alert retrieved
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Alert not found
- `500 Internal Server Error` - Database error

---

### PATCH - Resolve Alert
- **Route:** `PATCH /alerts/:alertId/resolve`
- **Full URL:** `http://localhost:5000/api/v1/alerts/990e8400-e29b-41d4-a716-446655440000/resolve`
- **Description:** Mark an alert as resolved
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{}
```

**Response (200 OK):**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "vehicleId": "660e8400-e29b-41d4-a716-446655440000",
  "type": "error",
  "severity": "HIGH",
  "title": "Engine Temperature Critical",
  "description": "Engine temperature exceeded 110°C. Immediate cooldown required.",
  "isResolved": true,
  "createdAt": "2026-03-02T10:30:45.123Z",
  "resolvedAt": "2026-03-02T10:35:00.123Z"
}
```

**Status Codes:**
- `200 OK` - Alert resolved successfully
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Alert not found
- `500 Internal Server Error` - Database error

---

## Recommendations Module

Base path: `/recommendations`

### GET - List Recommendations
- **Route:** `GET /recommendations`
- **Full URL:** `http://localhost:5000/api/v1/recommendations`
- **Description:** Get list of maintenance recommendations
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Query Parameters:**
- `vehicleId` (optional): Filter by vehicle ID
- `type` (optional): Filter by type (maintenance, safety, performance, efficiency)
- `severity` (optional): Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Example URL:**
```
http://localhost:5000/api/v1/recommendations?vehicleId=660e8400-e29b-41d4-a716-446655440000&type=maintenance
```

**Response (200 OK):**
```json
{
  "recommendations": [
    {
      "id": "aa1e8400-e29b-41d4-a716-446655440000",
      "vehicleId": "660e8400-e29b-41d4-a716-446655440000",
      "type": "maintenance",
      "severity": "HIGH",
      "title": "Engine Oil Change",
      "description": "Engine oil level is low. Schedule an oil change within 3 days.",
      "estimatedCost": 150,
      "recommendedDate": "2026-03-05",
      "createdAt": "2026-03-02T10:30:45.123Z"
    }
  ],
  "total": 1
}
```

**Status Codes:**
- `200 OK` - List retrieved
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Database error

---

### GET - Get Specific Recommendation
- **Route:** `GET /recommendations/:recommendationId`
- **Full URL:** `http://localhost:5000/api/v1/recommendations/aa1e8400-e29b-41d4-a716-446655440000`
- **Description:** Get detailed recommendation
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**URL Parameters:**
- `recommendationId` (string UUID, required): Recommendation ID

**Response (200 OK):**
```json
{
  "id": "aa1e8400-e29b-41d4-a716-446655440000",
  "vehicleId": "660e8400-e29b-41d4-a716-446655440000",
  "type": "maintenance",
  "severity": "HIGH",
  "title": "Engine Oil Change",
  "description": "Engine oil level is low. Schedule an oil change within 3 days.",
  "estimatedCost": 150,
  "recommendedDate": "2026-03-05",
  "createdAt": "2026-03-02T10:30:45.123Z"
}
```

**Status Codes:**
- `200 OK` - Recommendation retrieved
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Recommendation not found
- `500 Internal Server Error` - Database error

---

## Model Metadata Module

Base path: `/model-metadata`

### POST - Create Model Metadata
- **Route:** `POST /model-metadata`
- **Full URL:** `http://localhost:5000/api/v1/model-metadata`
- **Description:** Create or register a new ML model version
- **Authentication Required:** Yes (JWT Token with ADMIN role)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "modelVersion": "vehixa-heuristic-v2",
  "name": "Vehixa Health Prediction Model v2",
  "description": "ML model for vehicle health prediction with improved accuracy",
  "accuracy": 0.92,
  "precision": 0.89,
  "recall": 0.91,
  "f1Score": 0.90,
  "features": ["engineTemp", "oilPressure", "batteryVoltage", "rpm", "mileage"],
  "supportedVehicleModels": ["Tesla Model S", "Tesla Model 3", "BMW 3 Series"],
  "performanceMetrics": {
    "trainingTime": 3600,
    "inferenceTime": 0.25,
    "modelSize": 15.5
  }
}
```

**Response (201 Created):**
```json
{
  "id": "bb2e8400-e29b-41d4-a716-446655440000",
  "modelVersion": "vehixa-heuristic-v2",
  "name": "Vehixa Health Prediction Model v2",
  "description": "ML model for vehicle health prediction with improved accuracy",
  "accuracy": 0.92,
  "precision": 0.89,
  "recall": 0.91,
  "f1Score": 0.90,
  "trainedDate": "2026-03-02T10:30:45.123Z",
  "lastUpdatedDate": "2026-03-02T10:30:45.123Z",
  "features": ["engineTemp", "oilPressure", "batteryVoltage", "rpm", "mileage"],
  "supportedVehicleModels": ["Tesla Model S", "Tesla Model 3", "BMW 3 Series"]
}
```

**Status Codes:**
- `201 Created` - Model metadata created
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `500 Internal Server Error` - Database error

---

### GET - List All Model Metadata
- **Route:** `GET /model-metadata`
- **Full URL:** `http://localhost:5000/api/v1/model-metadata`
- **Description:** Get list of all available ML models
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Query Parameters:**
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "models": [
    {
      "id": "bb2e8400-e29b-41d4-a716-446655440000",
      "modelVersion": "vehixa-heuristic-v2",
      "name": "Vehixa Health Prediction Model v2",
      "accuracy": 0.92,
      "precision": 0.89,
      "recall": 0.91,
      "f1Score": 0.90,
      "trainedDate": "2026-03-02T10:30:45.123Z",
      "supportedVehicleModels": ["Tesla Model S", "Tesla Model 3"]
    }
  ],
  "total": 1
}
```

**Status Codes:**
- `200 OK` - List retrieved
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Database error

---

### GET - Get Latest Model
- **Route:** `GET /model-metadata/latest`
- **Full URL:** `http://localhost:5000/api/v1/model-metadata/latest`
- **Description:** Get the latest version of the ML model
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "id": "bb2e8400-e29b-41d4-a716-446655440000",
  "modelVersion": "vehixa-heuristic-v2",
  "name": "Vehixa Health Prediction Model v2",
  "description": "Latest ML model with best performance",
  "accuracy": 0.92,
  "precision": 0.89,
  "recall": 0.91,
  "f1Score": 0.90,
  "trainedDate": "2026-03-02T10:30:45.123Z",
  "lastUpdatedDate": "2026-03-02T10:30:45.123Z",
  "features": ["engineTemp", "oilPressure", "batteryVoltage", "rpm", "mileage"],
  "supportedVehicleModels": ["Tesla Model S", "Tesla Model 3", "BMW 3 Series"],
  "performanceMetrics": {
    "trainingTime": 3600,
    "inferenceTime": 0.25,
    "modelSize": 15.5
  }
}
```

**Status Codes:**
- `200 OK` - Model retrieved
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - No models found
- `500 Internal Server Error` - Database error

---

### GET - Get Model by Version
- **Route:** `GET /model-metadata/:version`
- **Full URL:** `http://localhost:5000/api/v1/model-metadata/vehixa-heuristic-v2`
- **Description:** Get specific model by version number
- **Authentication Required:** Yes (JWT Token)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**URL Parameters:**
- `version` (string, required): Model version identifier

**Response (200 OK):**
```json
{
  "id": "bb2e8400-e29b-41d4-a716-446655440000",
  "modelVersion": "vehixa-heuristic-v2",
  "name": "Vehixa Health Prediction Model v2",
  "description": "ML model for vehicle health prediction with improved accuracy",
  "accuracy": 0.92,
  "precision": 0.89,
  "recall": 0.91,
  "f1Score": 0.90,
  "trainedDate": "2026-03-02T10:30:45.123Z",
  "lastUpdatedDate": "2026-03-02T10:30:45.123Z",
  "features": ["engineTemp", "oilPressure", "batteryVoltage", "rpm", "mileage"],
  "supportedVehicleModels": ["Tesla Model S", "Tesla Model 3", "BMW 3 Series"],
  "performanceMetrics": {
    "trainingTime": 3600,
    "inferenceTime": 0.25,
    "modelSize": 15.5
  }
}
```

**Status Codes:**
- `200 OK` - Model retrieved
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Model version not found
- `500 Internal Server Error` - Database error

---

## Authentication

### JWT Token Usage
All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

### Token Refresh (If Implemented)
Most endpoints supporting JWT tokens expect:
- **Token Lifetime**: 7 days (configurable via JWT_EXPIRES_IN)
- **Token Encoding**: HS256
- **Token Payload**: User ID, Email, Role

### API Key Usage (Telemetry)
Telemetry ingestion endpoint accepts API key:

```
X-API-Key: <vehicle-api-key>
```

---

## Error Handling

### Standard Error Response Format

**400 Bad Request:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email format"
    }
  ],
  "code": "VALIDATION_ERROR"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authentication token",
  "code": "UNAUTHORIZED"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions for this action",
  "code": "FORBIDDEN"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Resource not found",
  "code": "NOT_FOUND"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "code": "INTERNAL_SERVER_ERROR"
}
```

---

## Rate Limiting

Rate limiting is applied to prevent abuse:
- **Limit**: 100 requests per 15 minutes per IP
- **Header**: `X-RateLimit-Remaining` shows remaining requests
- **Status**: `429 Too Many Requests` when limit exceeded

---

## Testing Tips

1. **Start with Health Check**: Test `GET /health` to verify server is running
2. **Register & Login**: Create account, then login to get JWT token
3. **Use Token**: Include token in all subsequent requests
4. **Test CRUD**: Create, read, update, delete operations for vehicles
5. **Submit Telemetry**: Ingest sample data using vehicle API key
6. **View Predictions**: Query health and alert endpoints
7. **Check Errors**: Observe error response format for debugging

---

## Example Request Flow

```
1. GET /health                          ✓ Server OK
2. POST /users/register                 → Get JWT token
3. POST /users/login                    → Get JWT token
4. GET /users/me                        ✓ Verified user
5. POST /vehicles                       → Create vehicle
6. GET /vehicles                        ✓ List vehicles
7. POST /telemetry                      → Ingest telemetry
8. GET /health-predictions              ✓ View health
9. GET /alerts                          ✓ View alerts
10. GET /recommendations                ✓ View recommendations
```

---

**Document Version**: 1.0  
**Last Updated**: March 2, 2026  
**Status**: Ready for Testing  
**Database Status**: ⚠️ Connection Issue (Requires Fix)
