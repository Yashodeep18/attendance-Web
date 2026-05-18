# Office Clock-In / Clock-Out Attendance System

A complete beginner-friendly MERN attendance application with:

- React + Vite frontend
- Tailwind CSS responsive UI
- Node.js + Express backend
- MongoDB Atlas / server MongoDB only
- Mongoose models
- JWT authentication
- bcrypt password hashing through `bcryptjs`
- Same `User` collection for normal users and admins
- Role-based frontend and backend protection
- Location-based clock-in / clock-out using browser Geolocation API and backend Haversine validation
- Lunch break deduction
- Late mark logic
- Attendance percentage calculation
- Admin user management, attendance filtering, and settings management

---

## 1. Architecture

### Frontend

The React frontend handles the UI only:

1. User signs up or logs in.
2. JWT token is saved in browser `localStorage`.
3. Axios sends the token in the `Authorization: Bearer <token>` header.
4. When the user clicks Clock In or Clock Out, the browser asks for location permission using:

```js
navigator.geolocation.getCurrentPosition()
```

5. Frontend sends only latitude and longitude to backend.
6. Frontend shows dashboard cards, timer, status, and errors.

### Backend

The backend is the final validation layer:

1. Verifies JWT token.
2. Checks user role.
3. Reads dynamic attendance settings from MongoDB.
4. Calculates user distance from office using Haversine formula.
5. Allows clock-in / clock-out only if the employee is within the configured office radius.
6. Calculates late status, worked minutes excluding lunch, remaining work time, and attendance percentage.
7. Stores attendance records in MongoDB Atlas.

### Database

MongoDB collections:

- `users`
- `attendances`
- `settings`

Admin and normal users are stored in the same `users` collection. The difference is the `role` field:

```js
role: "user" | "admin"
```

---

## 2. MongoDB Atlas setup from zero

### Step 1: Create MongoDB Atlas account

1. Open MongoDB Atlas website.
2. Sign up / login.
3. Create a new project, for example: `Attendance Project`.

### Step 2: Create free cluster

1. Click **Build a Database**.
2. Select **Free / M0 cluster**.
3. Choose a nearby cloud region.
4. Click **Create Deployment**.

### Step 3: Create database user

1. Go to **Database Access**.
2. Click **Add New Database User**.
3. Select password authentication.
4. Example:
   - Username: `attendance_user`
   - Password: create a strong password
5. Give permission: **Read and write to any database**.
6. Save the user.

### Step 4: Allow your IP address

1. Go to **Network Access**.
2. Click **Add IP Address**.
3. For development, click **Add Current IP Address**.
4. If your IP keeps changing, you can temporarily use `0.0.0.0/0` for development only.
5. Do not use `0.0.0.0/0` permanently in production.

### Step 5: Get connection string

1. Go to **Database**.
2. Click **Connect**.
3. Select **Drivers**.
4. Copy the connection string.

Example:

```env
MONGO_URI=mongodb+srv://attendance_user:<password>@cluster0.xxxxx.mongodb.net/attendance_db?retryWrites=true&w=majority
```

Replace `<password>` with your database user password.

Important: keep `/attendance_db` in the URI. MongoDB will create the database automatically when your app saves first data.

---

## 3. Backend setup

Open terminal:

```bash
cd attendance-app/backend
npm install
```

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
copy .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://attendance_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/attendance_db?retryWrites=true&w=majority
JWT_SECRET=make_one_long_random_secret_key
CLIENT_URL=http://localhost:5173
ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@12345
```

Start backend:

```bash
npm run dev
```

Test backend in browser:

```txt
http://localhost:5000/api/health
```

Expected output:

```json
{ "message": "Attendance backend is running." }
```

---

## 4. Create first admin user

Public signup creates only normal users. This is safer because otherwise any employee could register as admin.

After setting admin details in `backend/.env`, run:

```bash
cd attendance-app/backend
npm run create-admin
```

This creates or updates the admin user in the same `users` collection with:

```js
role: "admin"
```

Then login from frontend using admin email and password.

---

## 5. Frontend setup

Open another terminal:

```bash
cd attendance-app/frontend
npm install
```

Create `.env`:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
copy .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

Open:

```txt
http://localhost:5173
```

---

## 6. Normal user signup

1. Open `http://localhost:5173/register`.
2. Enter name, email, and password.
3. Backend hashes password using bcrypt algorithm.
4. User is saved in `users` collection with:

```js
role: "user"
```

5. User is redirected to the User Dashboard.

---

## 7. Role-based login redirect

After login:

- If `role === "user"`, frontend redirects to `/dashboard`.
- If `role === "admin"`, frontend redirects to `/admin`.

Frontend also blocks direct URL access:

- Normal users cannot open `/admin` routes.
- Admin users cannot open `/dashboard` route.

Backend also protects APIs:

- User APIs need valid JWT.
- Admin APIs need valid JWT + `role: "admin"`.

---

## 8. Browser location permission flow

When user clicks Clock In or Clock Out:

1. Browser asks location permission.
2. Frontend gets coordinates using browser Geolocation API.
3. Frontend sends coordinates to backend.
4. Backend compares user location with office coordinates:

```txt
Latitude: 18.586486
Longitude: 73.738709
Allowed radius: 30 meters
```

5. Backend uses Haversine formula.
6. If distance <= 30 meters, action is allowed.
7. If distance > 30 meters, backend returns:

```txt
You are outside the allowed office location range.
```

Location validation is not trusted only on frontend. Backend is final.

---

## 9. Attendance timing rules

Default settings:

| Setting | Default |
|---|---:|
| Clock-in start | 08:00 |
| Clock-in end | 09:00 |
| Late after | 09:00 |
| Lunch start | 12:00 |
| Lunch end | 13:00 |
| Required work | 480 minutes |
| Office latitude | 18.586486 |
| Office longitude | 73.738709 |
| Allowed radius | 30 meters |
| Timezone | Asia/Kolkata |

Late mark:

- Clock-in up to 09:00 = On Time
- Clock-in after 09:00 = Late

Working time:

- Lunch break 12:00 to 13:00 is deducted.
- Required actual work = 8 hours = 480 minutes.
- Attendance percentage:

```txt
workedMinutesExcludingLunch / requiredWorkMinutes * 100
```

---

## 10. Important folder structure

```txt
attendance-app/
  backend/
    src/
      config/db.js
      controllers/authController.js
      controllers/attendanceController.js
      controllers/adminController.js
      controllers/settingsController.js
      middleware/authMiddleware.js
      middleware/adminMiddleware.js
      models/User.js
      models/Attendance.js
      models/Settings.js
      routes/authRoutes.js
      routes/attendanceRoutes.js
      routes/adminRoutes.js
      routes/settingsRoutes.js
      utils/attendanceCalculator.js
      utils/locationUtils.js
      utils/timeUtils.js
      scripts/createAdmin.js
      server.js
    .env.example
    package.json

  frontend/
    src/
      api/axios.js
      components/Navbar.jsx
      components/ProtectedRoute.jsx
      components/AdminRoute.jsx
      components/StatusBadge.jsx
      components/Timer.jsx
      components/LocationPermissionMessage.jsx
      components/AttendanceCard.jsx
      components/AdminUserTable.jsx
      components/AttendanceTable.jsx
      components/SettingsForm.jsx
      context/AuthContext.jsx
      pages/Login.jsx
      pages/Register.jsx
      pages/UserDashboard.jsx
      pages/AdminDashboard.jsx
      pages/AdminUsers.jsx
      pages/AttendanceRecords.jsx
      pages/Settings.jsx
      pages/NotFound.jsx
      utils/geolocation.js
      utils/formatTime.js
      App.jsx
      main.jsx
      index.css
    .env.example
    package.json
    tailwind.config.js
    postcss.config.js
    vite.config.js
```

---

## 11. Beginner explanation of important backend files

### `config/db.js`

Connects backend to MongoDB Atlas using `MONGO_URI` from `.env`.

### `models/User.js`

Defines user fields: name, email, password, role. Password is hidden by default.

### `models/Attendance.js`

Stores daily clock-in / clock-out data. It has a unique index on user + date to prevent duplicate daily attendance.

### `models/Settings.js`

Stores attendance timing and office location settings. Admin can update it.

### `middleware/authMiddleware.js`

Checks JWT token and attaches logged-in user to `req.user`.

### `middleware/adminMiddleware.js`

Allows request only if `req.user.role === "admin"`.

### `utils/locationUtils.js`

Calculates distance from office using Haversine formula.

### `utils/attendanceCalculator.js`

Calculates late mark, worked minutes, lunch deduction, percentage, remaining time, and expected completion time.

### `controllers/attendanceController.js`

Handles clock-in, clock-out, today record, and user records.

---

## 12. Beginner explanation of important frontend files

### `api/axios.js`

Central Axios setup. Adds JWT token automatically to every request.

### `context/AuthContext.jsx`

Stores logged-in user and login/register/logout functions.

### `ProtectedRoute.jsx`

Blocks pages if user is not logged in or role does not match.

### `AdminRoute.jsx`

Allows only admins to open admin pages.

### `UserDashboard.jsx`

Shows clock-in/out buttons, current status, timer, percentage, and location messages.

### `AdminUsers.jsx`

Admin can view and delete users. Self-delete is blocked.

### `AttendanceRecords.jsx`

Admin can filter attendance records by date, user, late users, and percentage.

### `Settings.jsx`

Admin can update office time, lunch break, required work minutes, office location, and allowed radius.

---

## 13. Notes for local development

### Geolocation issue on localhost

Browser geolocation normally works on:

- `localhost`
- HTTPS domains

It may not work on plain HTTP public IP/domain.

### GPS accuracy issue

Laptop/system location may be less accurate than mobile GPS. Since your allowed radius is only 30 meters, test with a mobile device or increase radius temporarily from Admin Settings during development.

### Vite / Node note

This project pins Vite 5 to keep setup friendly for Node 18+ systems. If you use latest Vite releases, upgrade Node as per official Vite requirements.
