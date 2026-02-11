# ECO Impact Tracker - Frontend

React + TypeScript + Material UI frontend for the ECO Impact Tracker application.

## 🚀 Prerequisites

- Node.js 18+ and npm
- **Backend must be running on http://localhost:8081**

## 📦 Installation

```bash
npm install
```

## 🏃 Running the Application

```bash
npm run dev
```

The application will start on **http://localhost:5173**

## 🔧 Configuration

The API base URL is configured in `.env`:
```
VITE_API_BASE_URL=http://localhost:8081
```

## 📱 Features

### Authentication
- **Register**: Create a new account
- **Login**: Authenticate with email/password
- **JWT Token**: Automatically stored and sent with each API request
- **Protected Routes**: Redirects to login if not authenticated

### Dashboard
- **Date Range Filter**: Select period for statistics
- **Summary Cards**: Total CO₂ emissions and entry count
- **Line Chart**: CO₂ emissions by day (Recharts)
- **Pie Chart**: CO₂ emissions by activity type (Recharts)
- **Refresh Button**: Update statistics

### Entries (CRUD)
- **Create**: Add new carbon footprint entries
- **Read**: View all entries in a table
- **Update**: Edit existing entries
- **Delete**: Remove entries with confirmation
- **Features**:
  - Select activity template from dropdown
  - Enter quantity, date, and notes
  - Automatic CO₂ calculation (quantity × co2Factor)
  - Success/error notifications with Snackbar

### Templates (CRUD)
- **Create**: Add activity templates
- **Read**: View all templates
- **Update**: Edit templates
- **Delete**: Remove templates
- **Features**:
  - Select activity type
  - Define CO₂ factor and unit
  - Add data source reference

### Goals (CRUD + Progress)
- **Create**: Set CO₂ reduction goals
- **Read**: View all goals with progress
- **Update**: Edit goals
- **Delete**: Remove goals
- **Features**:
  - Set period (DAY/WEEK/MONTH)
  - Define target CO₂ limit
  - Set date range
  - **Progress Bar**: Automatically calculated from entries
  - Color-coded progress (green/warning/error)

## 🎨 Tech Stack

- **React 18** with TypeScript
- **Vite** - Build tool
- **Material UI (MUI)** - UI component library
- **React Router** - Navigation
- **Axios** - HTTP client with interceptors
- **Recharts** - Charts and graphs
- **date-fns** - Date formatting

## 📂 Project Structure

```
src/
├── api/                    # API client and methods
│   ├── axiosClient.ts     # Axios config with interceptors
│   ├── authApi.ts         # Authentication endpoints
│   ├── activityTypesApi.ts
│   ├── templatesApi.ts
│   ├── entriesApi.ts
│   ├── goalsApi.ts
│   └── statsApi.ts
├── auth/                   # Authentication
│   ├── AuthContext.tsx    # Auth state management
│   └── ProtectedRoute.tsx # Route guard
├── components/            # Reusable components
│   ├── AppLayout.tsx      # Main layout with drawer
│   ├── Loading.tsx
│   └── ErrorAlert.tsx
├── pages/                 # Main pages
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── EntriesPage.tsx
│   ├── TemplatesPage.tsx
│   └── GoalsPage.tsx
├── utils/                 # Utilities
│   └── tokenStorage.ts   # JWT token management
├── App.tsx               # Main app component
└── main.tsx             # Entry point
```

## 🔐 Authentication Flow

1. User registers/logs in via `/auth/register` or `/auth/login`
2. Backend returns JWT token
3. Token stored in localStorage
4. Axios interceptor adds `Authorization: Bearer <token>` to all requests
5. On 401 error: Token cleared, user redirected to login

## ✅ Functional Tests

### TEST A - Authentication
1. Go to http://localhost:5173/register
2. Create account (name, email, password)
3. Automatically redirected to Dashboard
4. Token visible in localStorage (`eco_tracker_token`)
5. Click Logout → Redirected to /login
6. Try accessing /dashboard without login → Redirected to /login

### TEST B - CRUD Operations
1. Login to the application
2. Go to **Templates** page
3. Click "Add Template"
   - If no activity types exist, you'll see a warning
   - First create an activity type (you can do this via Swagger or add a page)
4. Create template: "Car - Gasoline", unit: "km", CO₂ factor: 0.192
5. Go to **Entries** page
6. Click "Add Entry"
   - Select template
   - Enter quantity: 50 km
   - Select date
   - Add note
7. Entry appears in table with calculated CO₂ (50 × 0.192 = 9.6 kg)
8. Click Edit → Change quantity to 75 → Save
9. CO₂ updated to 14.4 kg
10. Click Delete → Confirm → Entry removed

### TEST C - Dashboard Statistics
1. Go to Dashboard
2. Note current Total CO₂
3. Go to Entries → Add new entry
4. Return to Dashboard → Click Refresh
5. Total CO₂ should increase
6. Check "CO₂ by Day" chart shows new data point
7. Check "CO₂ by Type" pie chart updated

### TEST D - Goals & Progress
1. Go to Goals page
2. Create goal: Monthly, 100 kg CO₂, current month
3. Progress bar shows current usage vs. target
4. Add entries → Return to Goals → Progress updates

## 🐛 Error Handling

- **Loading States**: Spinner shown during API calls
- **Error Alerts**: Material UI Alert components for errors
- **Snackbars**: Success/error notifications
- **401 Errors**: Automatic logout and redirect
- **Validation**: Form validation on all inputs

## 📝 Notes

- **Backend Required**: Ensure Spring Boot backend is running on port 8081
- **CORS**: Backend must allow requests from http://localhost:5173
- **Activity Types**: Need to be created before templates (can be done via Swagger)
- **Goal Progress**: Only calculated for ≤10 goals to avoid excessive API calls

## 🆘 Troubleshooting

**"Failed to load data"**
- Check backend is running on port 8081
- Verify PostgreSQL database is running
- Check browser console for CORS errors

**"401 Unauthorized"**
- Token may have expired (24h validity)
- Try logging out and logging in again

**Charts not showing**
- Ensure there are entries in the selected date range
- Check that entries have valid templates with CO₂ factors

## 🚀 Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

---

**Happy tracking! 🌱**
