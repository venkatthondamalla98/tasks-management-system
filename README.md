# 📋 TaskFlow — Task Management System
 
A full-stack task management application built with **Next.js**, **Node.js**, **TypeScript**, and **PostgreSQL**.
 
![TaskFlow](https://img.shields.io/badge/TaskFlow-Task%20Management-6366f1?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-TypeScript-339933?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-336791?style=for-the-badge&logo=postgresql)
 
---
 
## ✨ Features
 
- 🔐 **Authentication** — Register, Login, Logout with JWT Access + Refresh Tokens
- ✅ **Task CRUD** — Create, Read, Update, Delete tasks
- 🔄 **Status Toggle** — Cycle tasks through Pending → In Progress → Completed
- 🔍 **Search & Filter** — Filter by status, priority, and search by title
- 📊 **Dashboard Stats** — Live count of tasks by status
- 📱 **Responsive Design** — Works on desktop and mobile
- 🔒 **Secure** — Passwords hashed with bcrypt, protected routes with JWT
 
---
 
## 🛠️ Tech Stack
 
### Frontend
| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | React framework |
| TypeScript | Type safety |
| Material UI v7 | UI components |
| react-hot-toast | Notifications |
 
### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| TypeScript | Type safety |
| Prisma ORM | Database access |
| PostgreSQL | SQL database |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
 
---
 
## 📁 Project Structure
 
```
tasks-management-system/
├── client/                        # Next.js Frontend
│   └── src/
│       ├── app/
│       │   ├── layout.tsx         # Root layout + MUI theme
│       │   ├── page.tsx           # Redirect to /login
│       │   ├── login/page.tsx     # Login page
│       │   ├── register/page.tsx  # Register page
│       │   └── dashboard/page.tsx # Main dashboard
│       ├── components/
│       │   ├── TaskItem.tsx       # Task card component
│       │   └── ThemeRegistry.tsx  # MUI theme provider
│       └── lib/
│           ├── api.ts             # API client + token refresh
│           └── auth.ts            # Token storage helpers
│
└── server/                        # Node.js Backend
    ├── prisma/
    │   └── schema.prisma          # Database schema
    └── src/
        ├── config/prisma.ts       # Prisma client
        ├── controller/
        │   ├── auth.controller.ts
        │   └── task.controller.ts
        ├── middleware/
        │   └── auth.middleware.ts # JWT verification
        ├── routes/
        │   ├── auth.routes.ts
        │   └── task.routes.ts
        ├── services/
        │   ├── auth.service.ts
        │   └── task.service.ts
        └── utils/
            └── jwt.ts             # Token helpers
```
 
---
 
## 🚀 Getting Started
 
### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn
 
### 1. Clone the repository
```bash
git clone https://github.com/venkatthondamalla98/tasks-management-system.git
cd tasks-management-system
```
 
### 2. Setup the Backend
 
```bash
cd server
npm install
```
 
Create a `.env` file in the `server/` folder:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskManagementSystem"
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
PORT=5000
```
 
Run database migrations:
```bash
npx prisma migrate dev
npx prisma generate
```
 
Start the server:
```bash
npm run dev
```
 
Server runs at `http://localhost:5000`
 
### 3. Setup the Frontend
 
```bash
cd client
npm install
```
 
Create a `.env.local` file in the `client/` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
 
Start the frontend:
```bash
npm run dev
```
 
App runs at `http://localhost:3000`
 
---
 
## 🔌 API Endpoints
 
### Auth
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/refresh` | Refresh access token | ❌ |
| POST | `/api/auth/logout` | Logout user | ❌ |
 
### Tasks
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/tasks` | Get all tasks (with filters) | ✅ |
| POST | `/api/tasks` | Create a task | ✅ |
| GET | `/api/tasks/:id` | Get task by ID | ✅ |
| PATCH | `/api/tasks/:id` | Update a task | ✅ |
| DELETE | `/api/tasks/:id` | Delete a task | ✅ |
| PATCH | `/api/tasks/:id/toggle` | Toggle task status | ✅ |
 
### Query Parameters for GET /api/tasks
```
?status=pending|in_progress|completed
?priority=low|medium|high
?search=keyword
?page=1
?limit=20
```
 
---
 
## 🗄️ Database Schema
 
```prisma
model User {
  id            String         @id @default(uuid())
  name          String
  email         String         @unique
  password      String         # bcrypt hashed
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  tasks         Task[]
  refreshTokens RefreshToken[]
}
 
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime  # 7 days expiry
  createdAt DateTime @default(now())
}
 
model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(PENDING)
  priority    Priority   @default(MEDIUM)
  userId      String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```
 
---
 
## ☁️ Deployment
 
### Database → [Neon](https://neon.tech) (Free)
1. Create a project on Neon
2. Copy the connection string
3. Update `DATABASE_URL` in your backend env
4. Run `npx prisma migrate deploy`
 
### Backend → [Railway](https://railway.app) (Free)
1. Connect your GitHub repo
2. Set root directory to `server/`
3. Add environment variables
4. Railway auto-deploys on push
 
### Frontend → [Vercel](https://vercel.com) (Free)
1. Connect your GitHub repo
2. Set root directory to `client/`
3. Add `NEXT_PUBLIC_API_URL` pointing to Railway URL
4. Vercel auto-deploys on push
 
---
 
## 🔐 Authentication Flow
 
```
Register/Login → { accessToken (15min), refreshToken (7 days) }
     ↓
Store both tokens in localStorage + sessionStorage
     ↓
Every API request → Authorization: Bearer <accessToken>
     ↓
If 401 received → Auto refresh using refreshToken
     ↓
New accessToken stored → Original request retried
     ↓
If refresh fails → Redirect to /login
```
 
---
 
## 👤 Author
 
**Venkat Thondamalla**  
📧 venkatthondamalla@gmail.com
 
---
 
## 📄 License
 
This project is for educational purposes.