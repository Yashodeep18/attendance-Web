# Complete Code File by File

This file is generated as a convenient reference. Open the project folders for actual editable files.


## `README.md`

```markdown
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

```


## `backend/.env.example`

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173

# Used only by: npm run create-admin
ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@12345

```


## `backend/.gitignore`

```
node_modules
.env
.DS_Store
npm-debug.log

```


## `backend/package.json`

```json
{
  "name": "attendance-backend",
  "version": "1.0.0",
  "description": "Office Clock-In / Clock-Out Attendance System Backend",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "create-admin": "node src/scripts/createAdmin.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.9.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  }
}

```


## `backend/src/config/db.js`

```javascript
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in backend .env file");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;

```


## `backend/src/controllers/adminController.js`

```javascript
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json({ users });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (String(req.user._id) === String(id)) {
    return res.status(400).json({
      message: "Self delete is blocked for safety. Ask another admin to delete this admin account if required.",
    });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  await User.findByIdAndDelete(id);

  res.json({ message: "User deleted successfully. Existing attendance records are kept for audit history." });
};

export const getAllAttendance = async (req, res) => {
  const { date, userId, late, minPercentage, maxPercentage } = req.query;

  const filter = {};

  if (date) filter.date = date;
  if (userId) filter.userId = userId;
  if (late === "true") filter.status = "Late";

  if (minPercentage || maxPercentage) {
    filter.attendancePercentage = {};
    if (minPercentage) filter.attendancePercentage.$gte = Number(minPercentage);
    if (maxPercentage) filter.attendancePercentage.$lte = Number(maxPercentage);
  }

  const records = await Attendance.find(filter)
    .populate("userId", "name email role")
    .sort({ date: -1, createdAt: -1 });

  res.json({ records });
};

```


## `backend/src/controllers/attendanceController.js`

```javascript
import Attendance from "../models/Attendance.js";
import { getOrCreateSettings } from "./settingsController.js";
import { validateOfficeLocation } from "../utils/locationUtils.js";
import { getLocalDateString, minutesToHHMM } from "../utils/timeUtils.js";
import {
  buildAttendanceSummary,
  calculateAttendancePercentage,
  calculateLateStatus,
  calculateRemainingMinutes,
  calculateWorkedMinutesExcludingLunch,
} from "../utils/attendanceCalculator.js";

export const clockIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const settings = await getOrCreateSettings();

    const locationValidation = validateOfficeLocation({ latitude, longitude, settings });

    if (!locationValidation.isValid) {
      return res.status(400).json({
        message: locationValidation.message,
        distanceFromOfficeMeters: locationValidation.distanceFromOfficeMeters,
      });
    }

    const now = new Date();
    const today = getLocalDateString(now, settings.timezone);

    const existingAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: today,
    });

    if (existingAttendance) {
      return res.status(409).json({ message: "You have already clocked in today." });
    }

    const status = calculateLateStatus(now, settings);

    const attendance = await Attendance.create({
      userId: req.user._id,
      date: today,
      clockInTime: now,
      clockInLocation: {
        latitude: locationValidation.latitude,
        longitude: locationValidation.longitude,
        distanceFromOfficeMeters: locationValidation.distanceFromOfficeMeters,
      },
      status,
      isClockedIn: true,
      isClockedOut: false,
    });

    return res.status(201).json({
      message: status === "Late" ? "Clock-in successful. You are marked Late." : "Clock-in successful. You are On Time.",
      attendance: buildAttendanceSummary({ attendance, settings, now }),
      settings,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate clock-in is not allowed for the same date." });
    }

    return res.status(500).json({ message: error.message || "Clock-in failed." });
  }
};

export const clockOut = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const settings = await getOrCreateSettings();

    const locationValidation = validateOfficeLocation({ latitude, longitude, settings });

    if (!locationValidation.isValid) {
      return res.status(400).json({
        message: locationValidation.message,
        distanceFromOfficeMeters: locationValidation.distanceFromOfficeMeters,
      });
    }

    const now = new Date();
    const today = getLocalDateString(now, settings.timezone);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today,
    });

    if (!attendance) {
      return res.status(400).json({ message: "You must clock in before clocking out." });
    }

    if (attendance.isClockedOut) {
      return res.status(409).json({ message: "You have already clocked out today." });
    }

    const { workedMinutes, lunchBreakDeductedMinutes } =
      calculateWorkedMinutesExcludingLunch({
        clockInTime: attendance.clockInTime,
        clockOutTime: now,
        date: attendance.date,
        settings,
      });

    attendance.clockOutTime = now;
    attendance.clockOutLocation = {
      latitude: locationValidation.latitude,
      longitude: locationValidation.longitude,
      distanceFromOfficeMeters: locationValidation.distanceFromOfficeMeters,
    };
    attendance.workedMinutes = workedMinutes;
    attendance.lunchBreakDeductedMinutes = lunchBreakDeductedMinutes;
    attendance.attendancePercentage = calculateAttendancePercentage(
      workedMinutes,
      settings.requiredWorkMinutes
    );
    attendance.isClockedOut = true;
    attendance.isClockedIn = false;

    await attendance.save();

    return res.json({
      message: "Clock-out successful.",
      attendance: buildAttendanceSummary({ attendance, settings, now }),
      workedTimeHHMM: minutesToHHMM(workedMinutes),
      remainingTimeHHMM: minutesToHHMM(
        calculateRemainingMinutes(workedMinutes, settings.requiredWorkMinutes)
      ),
      settings,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Clock-out failed." });
  }
};

export const getTodayAttendance = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const today = getLocalDateString(new Date(), settings.timezone);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today,
    }).populate("userId", "name email role");

    if (!attendance) {
      return res.json({
        attendance: null,
        settings,
        today,
        message: "No attendance record found for today.",
      });
    }

    return res.json({
      attendance: buildAttendanceSummary({ attendance, settings }),
      settings,
      today,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load today's attendance." });
  }
};

export const getMyAttendanceRecords = async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(100);

    return res.json({ records });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load attendance records." });
  }
};

```


## `backend/src/controllers/authController.js`

```javascript
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Public signup always creates a normal user.
    // Admin users should be created with: npm run create-admin
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    const token = createToken(user);

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Registration failed." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = createToken(user);

    return res.json({
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Login failed." });
  }
};

export const me = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

```


## `backend/src/controllers/settingsController.js`

```javascript
import Settings from "../models/Settings.js";

const defaultSettings = {
  settingsKey: "global",
  clockInStartTime: "08:00",
  clockInEndTime: "09:00",
  lateAfterTime: "09:00",
  lunchStartTime: "12:00",
  lunchEndTime: "13:00",
  requiredWorkMinutes: 480,
  officeLatitude: 18.586486,
  officeLongitude: 73.738709,
  allowedRadiusMeters: 30,
  timezone: "Asia/Kolkata",
};

export const getOrCreateSettings = async () => {
  let settings = await Settings.findOne({ settingsKey: "global" });

  if (!settings) {
    settings = await Settings.create(defaultSettings);
  }

  return settings;
};

export const getSettings = async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
};

export const updateSettings = async (req, res) => {
  const allowedFields = [
    "clockInStartTime",
    "clockInEndTime",
    "lateAfterTime",
    "lunchStartTime",
    "lunchEndTime",
    "requiredWorkMinutes",
    "officeLatitude",
    "officeLongitude",
    "allowedRadiusMeters",
    "timezone",
  ];

  const updateData = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  updateData.updatedBy = req.user._id;

  const settings = await Settings.findOneAndUpdate(
    { settingsKey: "global" },
    updateData,
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ message: "Settings updated successfully.", settings });
};

```


## `backend/src/middleware/adminMiddleware.js`

```javascript
export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden. Admin access only." });
  }

  next();
};

```


## `backend/src/middleware/authMiddleware.js`

```javascript
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized. Token missing." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized. Invalid or expired token." });
  }
};

```


## `backend/src/models/Attendance.js`

```javascript
import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    distanceFromOfficeMeters: { type: Number, required: true },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
      // Format: YYYY-MM-DD according to Asia/Kolkata by default.
    },
    clockInTime: { type: Date, required: true },
    clockOutTime: { type: Date },
    clockInLocation: { type: locationSchema, required: true },
    clockOutLocation: { type: locationSchema },
    status: {
      type: String,
      enum: ["On Time", "Late"],
      required: true,
    },
    workedMinutes: { type: Number, default: 0 },
    lunchBreakDeductedMinutes: { type: Number, default: 0 },
    attendancePercentage: { type: Number, default: 0 },
    isClockedIn: { type: Boolean, default: true },
    isClockedOut: { type: Boolean, default: false },
  },
  { timestamps: true }
);

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;

```


## `backend/src/models/Settings.js`

```javascript
import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    settingsKey: {
      type: String,
      default: "global",
      unique: true,
      immutable: true,
    },
    clockInStartTime: { type: String, default: "08:00" },
    clockInEndTime: { type: String, default: "09:00" },
    lateAfterTime: { type: String, default: "09:00" },
    lunchStartTime: { type: String, default: "12:00" },
    lunchEndTime: { type: String, default: "13:00" },
    requiredWorkMinutes: { type: Number, default: 480 },
    officeLatitude: { type: Number, default: 18.586486 },
    officeLongitude: { type: Number, default: 73.738709 },
    allowedRadiusMeters: { type: Number, default: 30 },
    timezone: { type: String, default: "Asia/Kolkata" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;

```


## `backend/src/models/User.js`

```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;

```


## `backend/src/routes/adminRoutes.js`

```javascript
import express from "express";
import { deleteUser, getAllAttendance, getAllUsers } from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/attendance", getAllAttendance);

export default router;

```


## `backend/src/routes/attendanceRoutes.js`

```javascript
import express from "express";
import {
  clockIn,
  clockOut,
  getMyAttendanceRecords,
  getTodayAttendance,
} from "../controllers/attendanceController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/clock-in", clockIn);
router.post("/clock-out", clockOut);
router.get("/today", getTodayAttendance);
router.get("/my-records", getMyAttendanceRecords);

export default router;

```


## `backend/src/routes/authRoutes.js`

```javascript
import express from "express";
import { login, me, register } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);

export default router;

```


## `backend/src/routes/settingsRoutes.js`

```javascript
import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/", getSettings);
router.put("/", updateSettings);

export default router;

```


## `backend/src/scripts/createAdmin.js`

```javascript
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required in .env");
    }

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

    if (existingAdmin) {
      existingAdmin.role = "admin";
      if (ADMIN_PASSWORD) {
        existingAdmin.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
      }
      await existingAdmin.save();
      console.log(`Existing user updated as admin: ${ADMIN_EMAIL}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });

    console.log(`Admin created successfully: ${ADMIN_EMAIL}`);
    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exit(1);
  }
};

createAdmin();

```


## `backend/src/server.js`

```javascript
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ message: "Attendance backend is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

```


## `backend/src/utils/attendanceCalculator.js`

```javascript
import {
  getLocalMinutesOfDay,
  timeStringToMinutes,
  zonedDateTimeToUtcDate,
} from "./timeUtils.js";

export const calculateLateStatus = (clockInDate, settings) => {
  const clockInMinutes = getLocalMinutesOfDay(clockInDate, settings.timezone);
  const lateAfterMinutes = timeStringToMinutes(settings.lateAfterTime);

  return clockInMinutes > lateAfterMinutes ? "Late" : "On Time";
};

export const calculateWorkedMinutesExcludingLunch = ({
  clockInTime,
  clockOutTime,
  date,
  settings,
}) => {
  const start = new Date(clockInTime);
  const end = new Date(clockOutTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return {
      workedMinutes: 0,
      lunchBreakDeductedMinutes: 0,
    };
  }

  const totalMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);

  const lunchStart = zonedDateTimeToUtcDate(
    date,
    settings.lunchStartTime,
    settings.timezone
  );
  const lunchEnd = zonedDateTimeToUtcDate(
    date,
    settings.lunchEndTime,
    settings.timezone
  );

  const overlapStart = Math.max(start.getTime(), lunchStart.getTime());
  const overlapEnd = Math.min(end.getTime(), lunchEnd.getTime());
  const lunchBreakDeductedMinutes =
    overlapEnd > overlapStart ? Math.floor((overlapEnd - overlapStart) / 60000) : 0;

  return {
    workedMinutes: Math.max(0, totalMinutes - lunchBreakDeductedMinutes),
    lunchBreakDeductedMinutes,
  };
};

export const calculateAttendancePercentage = (workedMinutes, requiredWorkMinutes = 480) => {
  if (!requiredWorkMinutes || requiredWorkMinutes <= 0) return 0;

  const percentage = (workedMinutes / requiredWorkMinutes) * 100;
  return Number(Math.min(100, percentage).toFixed(2));
};

export const calculateRemainingMinutes = (workedMinutes, requiredWorkMinutes = 480) => {
  return Math.max(0, requiredWorkMinutes - workedMinutes);
};

export const calculateExpectedCompletionTime = ({ clockInTime, date, settings }) => {
  let pointer = new Date(clockInTime);
  let minutesLeft = settings.requiredWorkMinutes;

  const lunchStart = zonedDateTimeToUtcDate(
    date,
    settings.lunchStartTime,
    settings.timezone
  );
  const lunchEnd = zonedDateTimeToUtcDate(
    date,
    settings.lunchEndTime,
    settings.timezone
  );

  while (minutesLeft > 0) {
    if (pointer >= lunchStart && pointer < lunchEnd) {
      pointer = new Date(lunchEnd);
      continue;
    }

    const nextBreak = pointer < lunchStart ? lunchStart : null;
    const availableMinutesBeforeBreak = nextBreak
      ? Math.max(0, Math.floor((nextBreak.getTime() - pointer.getTime()) / 60000))
      : minutesLeft;

    const workChunk = Math.min(minutesLeft, availableMinutesBeforeBreak || minutesLeft);
    pointer = new Date(pointer.getTime() + workChunk * 60000);
    minutesLeft -= workChunk;

    if (nextBreak && pointer.getTime() === nextBreak.getTime()) {
      pointer = new Date(lunchEnd);
    }
  }

  return pointer;
};

export const buildAttendanceSummary = ({ attendance, settings, now = new Date() }) => {
  if (!attendance) return null;

  const endTime = attendance.isClockedOut ? attendance.clockOutTime : now;
  const { workedMinutes, lunchBreakDeductedMinutes } =
    calculateWorkedMinutesExcludingLunch({
      clockInTime: attendance.clockInTime,
      clockOutTime: endTime,
      date: attendance.date,
      settings,
    });

  const attendancePercentage = calculateAttendancePercentage(
    workedMinutes,
    settings.requiredWorkMinutes
  );

  const remainingRequiredMinutes = calculateRemainingMinutes(
    workedMinutes,
    settings.requiredWorkMinutes
  );

  const expectedCompletionTime = calculateExpectedCompletionTime({
    clockInTime: attendance.clockInTime,
    date: attendance.date,
    settings,
  });

  return {
    ...attendance.toObject(),
    liveWorkedMinutes: workedMinutes,
    liveLunchBreakDeductedMinutes: lunchBreakDeductedMinutes,
    liveAttendancePercentage: attendancePercentage,
    remainingRequiredMinutes,
    expectedCompletionTime,
  };
};

```


## `backend/src/utils/locationUtils.js`

```javascript
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const earthRadiusMeters = 6371000;
  const toRadians = (degree) => (degree * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
};

export const validateCoordinates = (latitude, longitude) => {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return { isValid: false, message: "Latitude and longitude must be numbers." };
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return { isValid: false, message: "Latitude or longitude is outside valid range." };
  }

  return { isValid: true, latitude: lat, longitude: lon };
};

export const validateOfficeLocation = ({ latitude, longitude, settings }) => {
  const coordinateCheck = validateCoordinates(latitude, longitude);

  if (!coordinateCheck.isValid) {
    return coordinateCheck;
  }

  const distanceFromOfficeMeters = calculateDistanceMeters(
    coordinateCheck.latitude,
    coordinateCheck.longitude,
    settings.officeLatitude,
    settings.officeLongitude
  );

  const isInsideOfficeRange = distanceFromOfficeMeters <= settings.allowedRadiusMeters;

  return {
    isValid: isInsideOfficeRange,
    latitude: coordinateCheck.latitude,
    longitude: coordinateCheck.longitude,
    distanceFromOfficeMeters: Number(distanceFromOfficeMeters.toFixed(2)),
    message: isInsideOfficeRange
      ? "Location is inside allowed office range."
      : "You are outside the allowed office location range.",
  };
};

```


## `backend/src/utils/timeUtils.js`

```javascript
export const timeStringToMinutes = (timeString = "00:00") => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToHHMM = (totalMinutes) => {
  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const getPartsInTimeZone = (date, timezone) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const map = {};

  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour === "24" ? "00" : map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
};

export const getLocalDateString = (date = new Date(), timezone = "Asia/Kolkata") => {
  const parts = getPartsInTimeZone(date, timezone);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
};

export const getLocalMinutesOfDay = (date = new Date(), timezone = "Asia/Kolkata") => {
  const parts = getPartsInTimeZone(date, timezone);
  return parts.hour * 60 + parts.minute;
};

const getTimeZoneOffsetMs = (date, timezone) => {
  const parts = getPartsInTimeZone(date, timezone);
  const localAsUTC = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return localAsUTC - date.getTime();
};

export const zonedDateTimeToUtcDate = (
  dateString,
  timeString,
  timezone = "Asia/Kolkata"
) => {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hour, minute] = timeString.split(":").map(Number);

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offsetMs = getTimeZoneOffsetMs(utcGuess, timezone);

  return new Date(utcGuess.getTime() - offsetMs);
};

export const formatDateTimeForUser = (date, timezone = "Asia/Kolkata") => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

```


## `frontend/.env.example`

```env
VITE_API_BASE_URL=http://localhost:5000/api

```


## `frontend/.gitignore`

```
node_modules
dist
.env
.DS_Store
npm-debug.log

```


## `frontend/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Office Attendance</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```


## `frontend/package.json`

```json
{
  "name": "attendance-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "axios": "^1.7.9",
    "vite": "^5.4.12",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.1"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17"
  }
}

```


## `frontend/postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

```


## `frontend/src/App.jsx`

```jsx
import { Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AttendanceRecords from "./pages/AttendanceRecords";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import UserDashboard from "./pages/UserDashboard";

const RoleRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6 text-center font-semibold">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
};

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <AdminRoute>
              <AttendanceRecords />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <Settings />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;

```


## `frontend/src/api/axios.js`

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("attendance_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("attendance_token");
    }
    return Promise.reject(error);
  }
);

export default api;

```


## `frontend/src/components/AdminRoute.jsx`

```jsx
import ProtectedRoute from "./ProtectedRoute";

const AdminRoute = ({ children }) => {
  return <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>;
};

export default AdminRoute;

```


## `frontend/src/components/AdminUserTable.jsx`

```jsx
import StatusBadge from "./StatusBadge";

const AdminUserTable = ({ users, currentUserId, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((item) => (
            <tr key={item._id} className="align-top">
              <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
              <td className="px-4 py-3 text-slate-600">{item.email}</td>
              <td className="px-4 py-3">
                <StatusBadge label={item.role === "admin" ? "Admin" : "User"} />
              </td>
              <td className="px-4 py-3 text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <button
                  disabled={item._id === currentUserId}
                  onClick={() => onDelete(item)}
                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserTable;

```


## `frontend/src/components/AttendanceCard.jsx`

```jsx
const AttendanceCard = ({ title, value, helper }) => {
  return (
    <div className="card">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      {helper && <p className="mt-1 text-sm text-slate-500">{helper}</p>}
    </div>
  );
};

export default AttendanceCard;

```


## `frontend/src/components/AttendanceTable.jsx`

```jsx
import { formatDateTime, formatMinutesToHHMM } from "../utils/formatTime";
import StatusBadge from "./StatusBadge";

const AttendanceTable = ({ records }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Clock In</th>
            <th className="px-4 py-3">Clock Out</th>
            <th className="px-4 py-3">Worked</th>
            <th className="px-4 py-3">Lunch Deducted</th>
            <th className="px-4 py-3">%</th>
            <th className="px-4 py-3">Distance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((record) => (
            <tr key={record._id} className="align-top">
              <td className="px-4 py-3 font-semibold">{record.date}</td>
              <td className="px-4 py-3">
                <p className="font-semibold">{record.userId?.name || "Deleted User"}</p>
                <p className="text-xs text-slate-500">{record.userId?.email || "-"}</p>
              </td>
              <td className="px-4 py-3">
                <StatusBadge label={record.status} />
              </td>
              <td className="px-4 py-3 text-slate-600">{formatDateTime(record.clockInTime)}</td>
              <td className="px-4 py-3 text-slate-600">{formatDateTime(record.clockOutTime)}</td>
              <td className="px-4 py-3 font-semibold">{formatMinutesToHHMM(record.workedMinutes)}</td>
              <td className="px-4 py-3">{record.lunchBreakDeductedMinutes || 0} min</td>
              <td className="px-4 py-3 font-semibold">{record.attendancePercentage || 0}%</td>
              <td className="px-4 py-3 text-xs text-slate-600">
                In: {record.clockInLocation?.distanceFromOfficeMeters ?? "-"} m
                <br />
                Out: {record.clockOutLocation?.distanceFromOfficeMeters ?? "-"} m
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {records.length === 0 && <p className="p-6 text-center text-slate-500">No records found.</p>}
    </div>
  );
};

export default AttendanceTable;

```


## `frontend/src/components/LocationPermissionMessage.jsx`

```jsx
const LocationPermissionMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <p className="font-semibold">Location message</p>
      <p>{message}</p>
      <p className="mt-2 text-xs">
        Browser location permission is required because clock-in and clock-out are allowed only within office range.
      </p>
    </div>
  );
};

export default LocationPermissionMessage;

```


## `frontend/src/components/Navbar.jsx`

```jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navClass = ({ isActive }) =>
  `rounded-xl px-3 py-2 text-sm font-semibold ${
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="text-lg font-black text-slate-900">
          Office Attendance
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {user?.role === "user" && (
            <NavLink to="/dashboard" className={navClass}>
              User Dashboard
            </NavLink>
          )}

          {user?.role === "admin" && (
            <>
              <NavLink to="/admin" className={navClass} end>
                Admin
              </NavLink>
              <NavLink to="/admin/users" className={navClass}>
                Users
              </NavLink>
              <NavLink to="/admin/attendance" className={navClass}>
                Attendance
              </NavLink>
              <NavLink to="/admin/settings" className={navClass}>
                Settings
              </NavLink>
            </>
          )}

          {user ? (
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navClass}>
                Sign Up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

```


## `frontend/src/components/ProtectedRoute.jsx`

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center font-semibold">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return children;
};

export default ProtectedRoute;

```


## `frontend/src/components/SettingsForm.jsx`

```jsx
import { useEffect, useState } from "react";

const fields = [
  ["clockInStartTime", "Clock-in Start Time", "time"],
  ["clockInEndTime", "Clock-in End Time", "time"],
  ["lateAfterTime", "Late After Time", "time"],
  ["lunchStartTime", "Lunch Start Time", "time"],
  ["lunchEndTime", "Lunch End Time", "time"],
  ["requiredWorkMinutes", "Required Working Minutes", "number"],
  ["officeLatitude", "Office Latitude", "number"],
  ["officeLongitude", "Office Longitude", "number"],
  ["allowedRadiusMeters", "Allowed Radius Meters", "number"],
  ["timezone", "Timezone", "text"],
];

const SettingsForm = ({ settings, onSubmit, saving }) => {
  const [form, setForm] = useState({});

  useEffect(() => {
    setForm(settings || {});
  }, [settings]);

  const handleChange = (event) => {
    const { name, value, type } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="card grid gap-4 sm:grid-cols-2">
      {fields.map(([name, label, type]) => (
        <div key={name}>
          <label className="label" htmlFor={name}>
            {label}
          </label>
          <input
            id={name}
            name={name}
            type={type}
            step={type === "number" ? "any" : undefined}
            value={form[name] ?? ""}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
      ))}

      <div className="sm:col-span-2">
        <button disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;

```


## `frontend/src/components/StatusBadge.jsx`

```jsx
const styles = {
  "On Time": "bg-emerald-100 text-emerald-700 border-emerald-200",
  Late: "bg-amber-100 text-amber-800 border-amber-200",
  "Clocked In": "bg-blue-100 text-blue-700 border-blue-200",
  "Clocked Out": "bg-slate-100 text-slate-700 border-slate-200",
  "Outside Location": "bg-red-100 text-red-700 border-red-200",
  Admin: "bg-purple-100 text-purple-700 border-purple-200",
  User: "bg-slate-100 text-slate-700 border-slate-200",
};

const StatusBadge = ({ label }) => {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[label] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
      {label}
    </span>
  );
};

export default StatusBadge;

```


## `frontend/src/components/Timer.jsx`

```jsx
import { useEffect, useState } from "react";
import { calculateWorkedSecondsExcludingLunch, formatSecondsToHHMMSS } from "../utils/formatTime";

const Timer = ({ clockInTime, clockOutTime, lunchStartTime, lunchEndTime, onTick }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const update = () => {
      const calculatedSeconds = calculateWorkedSecondsExcludingLunch({
        clockInTime,
        endTime: clockOutTime || new Date(),
        lunchStartTime,
        lunchEndTime,
      });
      setSeconds(calculatedSeconds);
      onTick?.(calculatedSeconds);
    };

    update();

    if (clockOutTime) return undefined;

    const intervalId = setInterval(update, 1000);
    return () => clearInterval(intervalId);
  }, [clockInTime, clockOutTime, lunchStartTime, lunchEndTime]);

  return <span className="font-mono text-2xl font-bold">{formatSecondsToHHMMSS(seconds)}</span>;
};

export default Timer;

```


## `frontend/src/context/AuthContext.jsx`

```jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("attendance_token"));
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    if (!localStorage.getItem("attendance_token")) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem("attendance_token");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("attendance_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    localStorage.setItem("attendance_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("attendance_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

```


## `frontend/src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  min-height: 100vh;
  background: #f8fafc;
  color: #0f172a;
}

input,
select,
button {
  font: inherit;
}

.card {
  @apply rounded-2xl border border-slate-200 bg-white p-5 shadow-sm;
}

.btn-primary {
  @apply rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400;
}

.btn-secondary {
  @apply rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60;
}

.input {
  @apply w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200;
}

.label {
  @apply mb-1 block text-sm font-medium text-slate-700;
}

```


## `frontend/src/main.jsx`

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

```


## `frontend/src/pages/AdminDashboard.jsx`

```jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AttendanceCard from "../components/AttendanceCard";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, recordsRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/attendance"),
        ]);
        setUsers(usersRes.data.users);
        setRecords(recordsRes.data.records);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load admin dashboard.");
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const lateCount = records.filter((record) => record.status === "Late").length;
    const clockedOutCount = records.filter((record) => record.isClockedOut).length;
    return { lateCount, clockedOutCount };
  }, [records]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">Admin Dashboard</h1>
      <p className="mt-1 text-slate-500">Manage users, attendance records, and office attendance settings.</p>

      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AttendanceCard title="Total Users" value={users.length} />
        <AttendanceCard title="Attendance Records" value={records.length} />
        <AttendanceCard title="Late Records" value={stats.lateCount} />
        <AttendanceCard title="Clocked Out" value={stats.clockedOutCount} />
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Link className="card hover:border-slate-400" to="/admin/users">
          <h2 className="text-xl font-bold">Users</h2>
          <p className="mt-2 text-sm text-slate-500">View all users and delete user accounts.</p>
        </Link>
        <Link className="card hover:border-slate-400" to="/admin/attendance">
          <h2 className="text-xl font-bold">Attendance Records</h2>
          <p className="mt-2 text-sm text-slate-500">Filter records by date, user, late status, and percentage.</p>
        </Link>
        <Link className="card hover:border-slate-400" to="/admin/settings">
          <h2 className="text-xl font-bold">Settings</h2>
          <p className="mt-2 text-sm text-slate-500">Manage timing, lunch break, office location, and radius.</p>
        </Link>
      </section>
    </main>
  );
};

export default AdminDashboard;

```


## `frontend/src/pages/AdminUsers.jsx`

```jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminUserTable from "../components/AdminUserTable";
import { useAuth } from "../context/AuthContext";

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (selectedUser) => {
    if (selectedUser._id === user._id) {
      alert("You cannot delete yourself from this page.");
      return;
    }

    const confirmed = window.confirm(`Delete user ${selectedUser.name}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const { data } = await api.delete(`/admin/users/${selectedUser._id}`);
      setMessage(data.message);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">Users Management</h1>
      <p className="mt-1 text-slate-500">All normal users and admins are stored in the same User collection.</p>

      {message && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-emerald-700">{message}</p>}
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      <section className="mt-6">
        <AdminUserTable users={users} currentUserId={user._id} onDelete={handleDelete} />
      </section>
    </main>
  );
};

export default AdminUsers;

```


## `frontend/src/pages/AttendanceRecords.jsx`

```jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import AttendanceTable from "../components/AttendanceTable";

const AttendanceRecords = () => {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ date: "", userId: "", late: "", minPercentage: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    const { data } = await api.get("/admin/users");
    setUsers(data.users);
  };

  const loadRecords = async (selectedFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (selectedFilters.date) params.date = selectedFilters.date;
      if (selectedFilters.userId) params.userId = selectedFilters.userId;
      if (selectedFilters.late) params.late = selectedFilters.late;
      if (selectedFilters.minPercentage) params.minPercentage = selectedFilters.minPercentage;

      const { data } = await api.get("/admin/attendance", { params });
      setRecords(data.records);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    loadRecords();
  }, []);

  const handleChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    loadRecords();
  };

  const clearFilters = () => {
    const emptyFilters = { date: "", userId: "", late: "", minPercentage: "" };
    setFilters(emptyFilters);
    loadRecords(emptyFilters);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">Attendance Records</h1>
      <p className="mt-1 text-slate-500">Filter attendance by date, user, late status, and percentage.</p>

      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="card mt-6 grid gap-4 md:grid-cols-5">
        <div>
          <label className="label">Date</label>
          <input type="date" name="date" value={filters.date} onChange={handleChange} className="input" />
        </div>
        <div>
          <label className="label">User</label>
          <select name="userId" value={filters.userId} onChange={handleChange} className="input">
            <option value="">All users</option>
            {users.map((item) => (
              <option key={item._id} value={item._id}>{item.name} - {item.email}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Late Users</label>
          <select name="late" value={filters.late} onChange={handleChange} className="input">
            <option value="">All</option>
            <option value="true">Late only</option>
          </select>
        </div>
        <div>
          <label className="label">Min %</label>
          <input type="number" name="minPercentage" value={filters.minPercentage} onChange={handleChange} className="input" placeholder="e.g. 80" />
        </div>
        <div className="flex items-end gap-2">
          <button className="btn-primary" disabled={loading}>{loading ? "Loading..." : "Filter"}</button>
          <button type="button" className="btn-secondary" onClick={clearFilters}>Clear</button>
        </div>
      </form>

      <section className="mt-6">
        <AttendanceTable records={records} />
      </section>
    </main>
  );
};

export default AttendanceRecords;

```


## `frontend/src/pages/Login.jsx`

```jsx
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(form.email, form.password);
      navigate(loggedInUser.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-md items-center px-4 py-8">
      <form onSubmit={handleSubmit} className="card w-full">
        <h1 className="text-2xl font-black">Login</h1>
        <p className="mt-1 text-sm text-slate-500">Login using your registered email and password.</p>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="mt-5">
          <label className="label">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="input" required />
        </div>

        <div className="mt-4">
          <label className="label">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="input" required />
        </div>

        <button disabled={loading} className="btn-primary mt-5 w-full">
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          New employee? <Link className="font-semibold text-slate-900 underline" to="/register">Create account</Link>
        </p>
      </form>
    </main>
  );
};

export default Login;

```


## `frontend/src/pages/NotFound.jsx`

```jsx
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-black">404</h1>
      <p className="mt-3 text-slate-600">Page not found.</p>
      <Link to="/" className="btn-primary mt-6">Go Home</Link>
    </main>
  );
};

export default NotFound;

```


## `frontend/src/pages/Register.jsx`

```jsx
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const createdUser = await register(form);
      navigate(createdUser.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-md items-center px-4 py-8">
      <form onSubmit={handleSubmit} className="card w-full">
        <h1 className="text-2xl font-black">Sign Up</h1>
        <p className="mt-1 text-sm text-slate-500">Public signup creates a normal user account.</p>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="mt-5">
          <label className="label">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="input" required minLength="2" />
        </div>

        <div className="mt-4">
          <label className="label">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="input" required />
        </div>

        <div className="mt-4">
          <label className="label">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="input" required minLength="6" />
        </div>

        <button disabled={loading} className="btn-primary mt-5 w-full">
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already registered? <Link className="font-semibold text-slate-900 underline" to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
};

export default Register;

```


## `frontend/src/pages/Settings.jsx`

```jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import SettingsForm from "../components/SettingsForm";

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      const { data } = await api.get("/settings");
      setSettings(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load settings.");
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { data } = await api.put("/settings", formData);
      setSettings(data.settings);
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-black">Attendance Settings</h1>
      <p className="mt-1 text-slate-500">
        Default office coordinates are 18.586486, 73.738709 with 30 meter allowed radius.
      </p>

      {message && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-emerald-700">{message}</p>}
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      <section className="mt-6">
        {settings ? <SettingsForm settings={settings} onSubmit={handleSubmit} saving={saving} /> : <p>Loading settings...</p>}
      </section>
    </main>
  );
};

export default Settings;

```


## `frontend/src/pages/UserDashboard.jsx`

```jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import AttendanceCard from "../components/AttendanceCard";
import LocationPermissionMessage from "../components/LocationPermissionMessage";
import StatusBadge from "../components/StatusBadge";
import Timer from "../components/Timer";
import { getCurrentLocation } from "../utils/geolocation";
import { formatDateTime, formatMinutesToHHMM } from "../utils/formatTime";

const UserDashboard = () => {
  const [attendance, setAttendance] = useState(null);
  const [settings, setSettings] = useState(null);
  const [today, setToday] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [liveSeconds, setLiveSeconds] = useState(0);

  const loadToday = async () => {
    try {
      const { data } = await api.get("/attendance/today");
      setAttendance(data.attendance);
      setSettings(data.settings);
      setToday(data.today);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadToday();
  }, []);

  const liveWorkedMinutes = useMemo(() => {
    if (!attendance) return 0;
    if (attendance.isClockedOut) return attendance.workedMinutes || 0;
    return Math.floor(liveSeconds / 60);
  }, [attendance, liveSeconds]);

  const livePercentage = useMemo(() => {
    if (!settings) return 0;
    return Math.min(100, ((liveWorkedMinutes / settings.requiredWorkMinutes) * 100).toFixed(2));
  }, [liveWorkedMinutes, settings]);

  const remainingMinutes = useMemo(() => {
    if (!settings) return 0;
    return Math.max(0, settings.requiredWorkMinutes - liveWorkedMinutes);
  }, [settings, liveWorkedMinutes]);

  const performAttendanceAction = async (type) => {
    setError("");
    setMessage("");
    setLocationMessage("Getting your current location...");
    setActionLoading(true);

    try {
      const location = await getCurrentLocation();
      setLocationMessage(`Location captured. Accuracy: approximately ${Math.round(location.accuracy)} meters.`);

      const endpoint = type === "clock-in" ? "/attendance/clock-in" : "/attendance/clock-out";
      const { data } = await api.post(endpoint, {
        latitude: location.latitude,
        longitude: location.longitude,
      });

      setMessage(data.message);
      setAttendance(data.attendance);
      setSettings(data.settings);
      await loadToday();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Attendance action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <main className="p-6 text-center font-semibold">Loading dashboard...</main>;
  }

  const canClockIn = !attendance;
  const canClockOut = attendance?.isClockedIn && !attendance?.isClockedOut;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">User Dashboard</h1>
          <p className="mt-1 text-slate-500">Today: {today || "-"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {attendance?.status && <StatusBadge label={attendance.status} />}
          {attendance?.isClockedIn && <StatusBadge label="Clocked In" />}
          {attendance?.isClockedOut && <StatusBadge label="Clocked Out" />}
        </div>
      </div>

      {message && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-emerald-700">{message}</p>}
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      <div className="mt-5">
        <LocationPermissionMessage message={locationMessage} />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AttendanceCard
          title="Live Working Timer"
          value={
            attendance ? (
              <Timer
                clockInTime={attendance.clockInTime}
                clockOutTime={attendance.clockOutTime}
                lunchStartTime={settings?.lunchStartTime}
                lunchEndTime={settings?.lunchEndTime}
                onTick={setLiveSeconds}
              />
            ) : (
              "00:00:00"
            )
          }
          helper="Lunch break is excluded."
        />
        <AttendanceCard title="Attendance %" value={`${livePercentage || 0}%`} helper="Required work: 8 hours" />
        <AttendanceCard title="Worked Time" value={formatMinutesToHHMM(liveWorkedMinutes)} helper="HH:MM excluding lunch" />
        <AttendanceCard title="Remaining Time" value={formatMinutesToHHMM(remainingMinutes)} helper="Required work remaining" />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="text-xl font-bold">Attendance Action</h2>
          <p className="mt-1 text-sm text-slate-500">
            Office location validation is done on backend using 30 meter radius.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              disabled={!canClockIn || actionLoading}
              onClick={() => performAttendanceAction("clock-in")}
              className="btn-primary"
            >
              {actionLoading ? "Please wait..." : "Clock In"}
            </button>
            <button
              disabled={!canClockOut || actionLoading}
              onClick={() => performAttendanceAction("clock-out")}
              className="btn-secondary"
            >
              {actionLoading ? "Please wait..." : "Clock Out"}
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold">Today Details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Clock In</dt>
              <dd className="font-semibold text-right">{formatDateTime(attendance?.clockInTime)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Clock Out</dt>
              <dd className="font-semibold text-right">{formatDateTime(attendance?.clockOutTime)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Late Status</dt>
              <dd className="font-semibold">{attendance?.status || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Expected Completion</dt>
              <dd className="font-semibold text-right">{formatDateTime(attendance?.expectedCompletionTime)}</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
};

export default UserDashboard;

```


## `frontend/src/utils/formatTime.js`

```javascript
export const formatMinutesToHHMM = (minutes = 0) => {
  const safeMinutes = Math.max(0, Math.floor(minutes));
  const h = Math.floor(safeMinutes / 60);
  const m = safeMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const formatSecondsToHHMMSS = (seconds = 0) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const formatDateTime = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const timeStringToMinutes = (timeString = "00:00") => {
  const [h, m] = timeString.split(":").map(Number);
  return h * 60 + m;
};

const localDateString = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const map = {};
  parts.forEach((part) => {
    if (part.type !== "literal") map[part.type] = part.value;
  });

  return `${map.year}-${map.month}-${map.day}`;
};

const getLunchDate = (dateString, timeString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hour, minute] = timeString.split(":").map(Number);
  // Asia/Kolkata is UTC+05:30. This app default timezone is Asia/Kolkata.
  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30, 0));
};

export const calculateWorkedSecondsExcludingLunch = ({
  clockInTime,
  endTime = new Date(),
  lunchStartTime = "12:00",
  lunchEndTime = "13:00",
}) => {
  if (!clockInTime) return 0;

  const start = new Date(clockInTime);
  const end = new Date(endTime);

  if (end <= start) return 0;

  const totalSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
  const dateString = localDateString(start);
  const lunchStart = getLunchDate(dateString, lunchStartTime);
  const lunchEnd = getLunchDate(dateString, lunchEndTime);

  const overlapStart = Math.max(start.getTime(), lunchStart.getTime());
  const overlapEnd = Math.min(end.getTime(), lunchEnd.getTime());
  const lunchDeductedSeconds =
    overlapEnd > overlapStart ? Math.floor((overlapEnd - overlapStart) / 1000) : 0;

  return Math.max(0, totalSeconds - lunchDeductedSeconds);
};

```


## `frontend/src/utils/geolocation.js`

```javascript
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("Location permission denied. Please allow location access."));
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          reject(new Error("Location information is unavailable."));
        } else if (error.code === error.TIMEOUT) {
          reject(new Error("Location request timed out. Please try again."));
        } else {
          reject(new Error("Unable to get current location."));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
};

```


## `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

```


## `frontend/vite.config.js`

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});

```
