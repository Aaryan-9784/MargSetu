# 🚀 RoadSetu Production Deployment & Architecture Summary

## 🌐 Live Deployment Links
* **Frontend (Vercel)**: https://marg-setu.vercel.app *(or your active Vercel domain)*
* **Backend API (Render)**: https://margsetu-k936.onrender.com
* **API Health Check**: https://margsetu-k936.onrender.com/api/health
* **API Service Index**: https://margsetu-k936.onrender.com/

---

## 🔐 Demo Credentials (RBAC Supported)
| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@roadsetu.gov.in` | `Admin@123` | Full system access, Asset creation & deletion, Maintenance resolution |
| **Field Inspector** | `inspector.patel@roadsetu.gov.in` | `Inspector@123` | Conduct field inspections, Report structural defects, Log maintenance requests |
| **Maintenance Officer** | `engineer.sharma@roadsetu.gov.in` | `Officer@123` | View assigned work orders, update repair statuses, resolve tickets |

---

## 🏗️ Technical Architecture
1. **Frontend**: React 18 + Vite 6 + Tailwind CSS, React Leaflet (OpenStreetMap GIS layer), Recharts analytics dashboard.
2. **Backend**: Node.js & Express REST API with dynamic CORS, JWT auth, and RBAC middleware.
3. **Database**: MongoDB Atlas M0 cloud cluster with auto-seeding on fresh deployments.
4. **Hosting**: Frontend on Vercel Edge CDN; Backend containerized on Render.
