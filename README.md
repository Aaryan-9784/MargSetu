# 🚀 ROADSETU — Government Road & Transportation Infrastructure Asset Lifecycle Management System

<p align="center">
  <strong>RoadSetu</strong> — A centralized government transportation infrastructure asset inventory system for tracking and managing Roads, Highways, and Bridges across their complete lifecycle.
</p>

---

## 📋 Problem Statement

> "Building an end-to-end infrastructure asset inventory to track and manage assets across their entire lifecycle."

## 💡 Solution

**RoadSetu** is a production-quality MERN stack application that demonstrates complete lifecycle management of government transportation infrastructure assets. The system enables authorities to:

- Register Roads, Highways, and Bridges in a centralized inventory
- Track asset conditions through field inspections
- Detect and report defects/issues
- Create, assign, and track maintenance work orders
- Complete the full repair/rehabilitation workflow
- View the complete historical lifecycle timeline for every asset
- Monitor infrastructure health through real-time dashboards

## ✨ Key Features

| Feature | Description |
|---|---|
| **Asset Inventory** | Centralized registry of 25+ Roads, Highways, and Bridges |
| **Lifecycle Management** | Full event timeline from Registration → Retirement |
| **Field Inspection** | Condition assessment with severity and defect reporting |
| **Maintenance Workflow** | OPEN → ASSIGNED → IN_PROGRESS → RESOLVED |
| **RBAC** | Admin, Field Inspector, Maintenance Officer |
| **Interactive Maps** | React Leaflet + OpenStreetMap with asset markers |
| **Analytics Dashboard** | 5+ Recharts visualizations from live database metrics |
| **Professional UI** | Government-grade design with Tailwind CSS |

## 🏗️ Architecture

```
                    ASSET
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
        ROAD       HIGHWAY      BRIDGE
```

All three asset types share a common lifecycle workflow:

```
REGISTER → CONSTRUCT → OPERATE → INSPECT → DEFECT FOUND
→ MAINTENANCE → REPAIR → RE-INSPECT → OPERATIONAL → RETIRE
```

## 🔐 RBAC (Role-Based Access Control)

| Permission | Admin | Field Inspector | Maintenance Officer |
|---|:---:|:---:|:---:|
| View Dashboard | ✅ | ✅ | ✅ |
| View Assets | ✅ | ✅ | ✅ |
| Create Assets | ✅ | ❌ | ❌ |
| Edit/Delete Assets | ✅ | ❌ | ❌ |
| Create Inspections | ✅ | ✅ | ❌ |
| Create Maintenance | ✅ | ✅ | ✅ |
| Resolve Maintenance | ✅ | ❌ | ✅ |
| View Lifecycle | ✅ | ✅ | ✅ |

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite 6
- Tailwind CSS 3
- React Router 6
- Axios
- Recharts 2
- React Leaflet 4
- Lucide React

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs Password Hashing
- mongodb-memory-server (auto-fallback)

### Database
- MongoDB Atlas (production)
- mongodb-memory-server (local/hackathon)

## 📁 Folder Structure

```
MargSetu/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Asset.js
│   │   │   ├── Inspection.js
│   │   │   ├── Maintenance.js
│   │   │   └── LifecycleEvent.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── rbac.js
│   │   │   └── errorHandler.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── assetController.js
│   │   │   ├── inspectionController.js
│   │   │   ├── maintenanceController.js
│   │   │   ├── lifecycleController.js
│   │   │   └── dashboardController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── assetRoutes.js
│   │   │   ├── maintenanceRoutes.js
│   │   │   ├── lifecycleRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── server.js
│   │   └── seed.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── context/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🔌 API Routes

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |
| GET | `/api/assets` | Private |
| GET | `/api/assets/:id` | Private |
| POST | `/api/assets` | Admin |
| PUT | `/api/assets/:id` | Admin |
| DELETE | `/api/assets/:id` | Admin |
| GET | `/api/assets/:id/inspections` | Private |
| POST | `/api/assets/:id/inspections` | Admin, Inspector |
| GET | `/api/maintenance` | Private |
| GET | `/api/assets/:id/maintenance` | Private |
| POST | `/api/assets/:id/maintenance` | Admin, Inspector, Officer |
| PUT | `/api/maintenance/:id` | Admin, Officer |
| GET | `/api/assets/:id/lifecycle` | Private |
| GET | `/api/lifecycle` | Private |
| GET | `/api/dashboard/summary` | Private |
| GET | `/api/dashboard/activity` | Private |
| GET | `/api/dashboard/critical-assets` | Private |
| GET | `/api/health` | Public |

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- npm 9+
- (Optional) MongoDB Atlas URI

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=           # Leave blank for auto in-memory MongoDB
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
```

### 3. Run

```bash
# Terminal 1: Backend (auto-seeds on first run)
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 4. Seed Data (manual)
```bash
cd backend
npm run seed
```

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@roadsetu.gov.in | Admin@123 |
| **Field Inspector** | inspector.patel@roadsetu.gov.in | Inspector@123 |
| **Maintenance Officer** | engineer.sharma@roadsetu.gov.in | Officer@123 |

## 🎯 Primary Demo Flow (BR-014)

1. **Login** as Admin
2. **Dashboard** → See 26 assets, charts, critical assets
3. **Asset Inventory** → Search "BR-014"
4. **Asset Details** → Sabarmati Connector Bridge (POOR / UNDER_MAINTENANCE)
5. **Map** → View bridge location on OpenStreetMap
6. **Inspection** → See structural defect report
7. **Maintenance** → See active ticket TKT-2025-014 (IN_PROGRESS)
8. **Resolve** → Complete repair, set condition to GOOD
9. **Lifecycle** → View full timeline from Registration to Repair Completed
10. **Dashboard** → Verify updated metrics

## 🌐 Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

## 🔮 Future Scope

- AI-powered predictive maintenance scheduling
- Mobile application for field inspectors
- IoT sensor integration for real-time structural health monitoring
- GIS-based corridor visualization with advanced mapping
- Multi-state/national infrastructure asset federation
- Citizen grievance portal integration
- Budget and expenditure tracking module

---

**Built for Hackathon MVP** · RoadSetu Engineering Team
