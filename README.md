# Vehixa

**Intelligent Vehicle Health & Predictive Analytics Platform**

---

## 🧠 1. Problem Statement

Unexpected vehicle failures lead to:

- 🚨 Sudden breakdowns
- 💸 High maintenance costs
- ⏳ Operational downtime
- 📉 Fleet inefficiency

Most vehicle maintenance today is:

- **Manual**
- **Reactive**
- **Based on fixed service intervals**
- **Not data-driven**

There is no unified system that:

- Continuously ingests vehicle telemetry
- Evaluates real-time vehicle health
- Predicts failure risk
- Generates actionable recommendations

---

## 💡 2. Our Solution

**Vehixa** is an ML-powered vehicle health intelligence platform that:

- Collects **real-time telemetry** from vehicles, simulators, or digital twins
- Analyzes data using **machine learning models**
- Computes **health score & risk level**
- Predicts **potential failures**
- Generates **automated maintenance recommendations**
- Triggers **real-time alerts**

It acts as a **digital health engine for vehicles**.

---

## 🎯 3. Core Features

### 🔹 1. Multi-Source Telemetry Ingestion

**Supports telemetry from:**

- OBD devices
- Simulators
- API push systems
- Digital twins
- Manual entry

**Through:**

```http
POST /api/v1/telemetry
```

### 🔹 2. ML-Based Health Prediction

For each telemetry entry:

- Health Score (0–100)
- Health Status (Healthy / Warning / Critical)
- Failure Probability
- Risk Level
- Confidence Score
- Predicted Failure Timeline

Stored in `HealthPrediction`.

### 🔹 3. Actionable Recommendations

Instead of just predicting, the system generates:

- `INSPECT`
- `REPLACE`
- `SERVICE`
- `MONITOR`
- `CALIBRATE`
- `UPDATE_SOFTWARE`

Each recommendation includes:

- Priority level
- Action due timeline
- Description
- Linked prediction

### 🔹 4. Intelligent Alert System

When vehicle enters risky state:

- Generates alerts
- Categorized by severity
- Tracks resolution status
- Linked to prediction and vehicle

### 🔹 5. Fleet Dashboard (Web Interface)

Displays:

- Real-time vehicle status
- Risk distribution
- Health trend charts
- Failure probability heatmap
- Alert panel
- Recommendation tracking

### 🔹 6. Model Lifecycle Tracking

Tracks:

- ML model version
- Algorithm used
- Accuracy
- Precision / Recall / F1
- Training dataset size

Stored in `ModelMetadata`.

---

## 🏗 4. System Architecture

```
Telemetry Source (Simulator / OBD / API)
                ↓
      Express Backend API
                ↓
          PostgreSQL
                ↓
        ML Prediction Service
                ↓
    Health Prediction + Recommendation
                ↓
         Alert Engine
                ↓
          Web Dashboard
```

---

## ⚙️ 5. Technology Stack

### Backend

- **Node.js**
- **Express.js**
- **Prisma ORM**
- **PostgreSQL**

### ML Service

- **Python** (future microservice)
- **scikit-learn / XGBoost**
- **FastAPI** (optional microservice)

### Security

- **JWT Authentication**
- **Role-based access**
- **Rate limiting**
- **Input validation (Zod)**

### Optional Enhancements

- **WebSocket** (real-time updates)
- **Background job processing**
- **Batch telemetry ingestion**

---

## 🗃 6. Database Design Highlights

**Entities:**

- `User`
- `Vehicle`
- `Telemetry`
- `HealthPrediction`
- `Recommendation`
- `Alert`
- `ModelMetadata`

**Supports:**

- One-to-many relationships
- One-to-one telemetry-prediction mapping
- Action tracking
- Risk categorization
- Operational state tracking

---

## 🔬 7. Machine Learning Component

The ML model:

- Trained on historical telemetry dataset
- Performs classification (health status)
- Computes failure probability
- Outputs confidence score

**Uses structured features like:**

- Engine temperature
- Battery voltage
- RPM
- Oil pressure
- Mileage
- Vibration level
- Error codes

**The model version is tracked and stored.**

---

## 📡 8. Real-Time Data Capability

Vehixa supports:

- Continuous telemetry ingestion
- Live prediction triggering
- Event-based alert generation
- Scalable ingestion pipeline

This enables future integration with:

- Connected vehicles
- Smart garages
- Digital twin environments
- Automotive IoT systems

---

## 🏢 9. Target Users

- Fleet management companies
- Logistics companies
- Ride-sharing operators
- Smart mobility startups
- Insurance risk analytics platforms
- EV fleet operators

---

## 📈 10. Business Impact

Vehixa helps:

- Reduce unplanned downtime
- Detect early degradation patterns
- Optimize maintenance scheduling
- Improve fleet operational efficiency
- Reduce repair costs
- Enable data-driven vehicle management

---

## 🚀 11. Scalability & Future Scope

**Future improvements:**

- Predictive part failure detection
- EV battery degradation modeling
- Insurance premium risk scoring
- Multi-tenant SaaS architecture
- Edge computing integration
- AI-powered fleet optimization assistant

---

## 🔥 12. What Makes It Innovative?

Unlike traditional systems:

- **It doesn't just monitor.**
- **It predicts.**
- **It recommends.**
- **It adapts using ML.**
- **It tracks model lifecycle.**

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/AgnivaSardar/Vehixa-Backend.git
cd Vehixa-Backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required variables:**

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/vehixa
JWT_SECRET=your-super-secret-key
```

### 4. Run database migrations

```bash
npm run prisma:migrate
```

### 5. Generate Prisma client

```bash
npm run prisma:generate
```

### 6. Start the server

```bash
npm run dev
```

**Server runs on:** `http://localhost:5000`

---

## 📋 API Endpoints

### **Authentication**

| Method | Endpoint                   | Description       |
| ------ | -------------------------- | ----------------- |
| POST   | `/api/v1/users/register`   | Register new user |
| POST   | `/api/v1/users/login`      | Login user        |
| GET    | `/api/v1/users/me`         | Get current user  |
| GET    | `/api/v1/users`            | List all users    |

### **Vehicles**

| Method | Endpoint                          | Description        |
| ------ | --------------------------------- | ------------------ |
| POST   | `/api/v1/vehicles`                | Create vehicle     |
| GET    | `/api/v1/vehicles`                | List vehicles      |
| GET    | `/api/v1/vehicles/:vehicleId`     | Get vehicle        |
| PATCH  | `/api/v1/vehicles/:vehicleId`     | Update vehicle     |
| DELETE | `/api/v1/vehicles/:vehicleId`     | Delete vehicle     |

### **Telemetry**

| Method | Endpoint                            | Description        |
| ------ | ----------------------------------- | ------------------ |
| POST   | `/api/v1/telemetry`                 | Ingest telemetry   |
| GET    | `/api/v1/telemetry`                 | List telemetry     |
| GET    | `/api/v1/telemetry/:telemetryId`    | Get telemetry      |

### **Health Predictions**

| Method | Endpoint                                  | Description          |
| ------ | ----------------------------------------- | -------------------- |
| GET    | `/api/v1/health-predictions`              | List predictions     |
| GET    | `/api/v1/health-predictions/:predictionId`| Get prediction       |

### **Recommendations**

| Method | Endpoint                                          | Description           |
| ------ | ------------------------------------------------- | --------------------- |
| GET    | `/api/v1/recommendations`                         | List recommendations  |
| GET    | `/api/v1/recommendations/:recommendationId`       | Get recommendation    |

### **Alerts**

| Method | Endpoint                              | Description       |
| ------ | ------------------------------------- | ----------------- |
| GET    | `/api/v1/alerts`                      | List alerts       |
| GET    | `/api/v1/alerts/:alertId`             | Get alert         |
| PATCH  | `/api/v1/alerts/:alertId/resolve`     | Resolve alert     |

### **Model Metadata**

| Method | Endpoint                            | Description           |
| ------ | ----------------------------------- | --------------------- |
| POST   | `/api/v1/model-metadata`            | Create model record   |
| GET    | `/api/v1/model-metadata`            | List model metadata   |
| GET    | `/api/v1/model-metadata/latest`     | Get latest model      |
| GET    | `/api/v1/model-metadata/:version`   | Get model by version  |

---

## 📦 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/          # Database & environment config
│   ├── middlewares/     # Authentication, validation, error handling
│   ├── modules/         # Feature modules (users, vehicles, telemetry, etc.)
│   ├── routes/          # API route aggregation
│   ├── utils/           # Utilities (JWT, password, logger, ML client)
│   ├── jobs/            # Background jobs (telemetry processing)
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧪 Example: Telemetry Ingestion

**POST** `/api/v1/telemetry`

**Body:**

```json
{
  "vehicleId": "abc-123",
  "source": "SIMULATOR",
  "engineTemp": 98.5,
  "batteryVoltage": 12.4,
  "rpm": 2200,
  "oilPressure": 45,
  "mileage": 85000,
  "vibrationLevel": 2.5,
  "errorCodesCount": 1,
  "coolantLevel": 78,
  "recordedAt": "2026-03-01T10:30:00Z"
}
```

**Response:**

```json
{
  "telemetry": { ... },
  "prediction": {
    "healthScore": 85,
    "status": "WARNING",
    "failureProbability": 0.15,
    "riskLevel": "MODERATE",
    "confidenceScore": 0.82,
    "predictedFailureDays": 30
  },
  "recommendations": [ ... ],
  "alert": { ... }
}
```

---

## 📜 License

ISC

---

## 👤 Author

**Agniva Sardar**

- GitHub: [@AgnivaSardar](https://github.com/AgnivaSardar)

---

**Vehixa** — _Predicting vehicle health, one telemetry at a time._
