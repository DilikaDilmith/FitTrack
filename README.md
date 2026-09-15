# 🏋️ FitTrack — Ultimate Fitness & Wellness Tracking Mobile App

[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **FitTrack** is a modern, full-stack, cross-platform mobile application engineered for holistic fitness tracking. From curated HD workout routines and intelligent exercise recognition to nutrition macro tracking, daily hydration monitoring, interactive progress analytics, and real-time BMI calculations — FitTrack delivers a complete gym and lifestyle companion in your pocket.

---

## 📱 Table of Contents

- [Overview & Key Highlights](#-overview--key-highlights)
- [Key Features](#-key-features)
  - [1. 🏋️ Workouts & Exercise Library](#1-️-workouts--exercise-library)
  - [2. 🥗 Nutrition & Calorie Tracking](#2--nutrition--calorie-tracking)
  - [3. 💧 Water & Hydration Logger](#3--water--hydration-logger)
  - [4. ⚖️ Real-Time BMI Calculator](#4-️-real-time-bmi-calculator)
  - [5. 📊 Interactive Progress & Analytics](#5--interactive-progress--analytics)
  - [6. 🌓 Dual Themes (Light & Dark)](#6--dual-themes-light--dark)
  - [7. 🔒 Multi-User Cloud Sync & Data Isolation](#7--multi-user-cloud-sync--data-isolation)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [API Reference](#-api-reference)
- [Getting Started & Installation](#-getting-started--installation)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Environment Variables](#-environment-variables)
- [Design System & Visual Aesthetics](#-design-system--visual-aesthetics)
- [License](#-license)

---

## 🌟 Overview & Key Highlights

- **Visual Excellence**: Built with curated high-definition (HD) Unsplash fitness photography, glassmorphism overlays, multi-stop linear gradients, and smooth micro-animations.
- **Intelligent Exercise Matcher**: Automatically matches any exercise name (standard, plural, hyphenated, or custom) to high-resolution exercise action photos.
- **Per-User Cloud Isolation**: Full multi-tenant data isolation backed by MongoDB and JSON Web Tokens (JWT). Every user has a private workout library, calorie logs, and progress stats.
- **Offline First**: Instant UI updates via local AsyncStorage caching with automatic background cloud synchronization.
- **Cross-Platform**: Seamlessly runs on Android, iOS, and Web via Expo.

---

## 🚀 Key Features

### 1. 🏋️ Workouts & Exercise Library
- **9 Core Muscle Categories**: Curated workouts for Chest, Back, Arms, Legs, Shoulders, Abs, Cardio, Yoga, and Glutes.
- **Over 50+ Pre-Configured Exercises**: Built with sets, reps, and targets ready to track.
- **Smart HD Image Matching**: Every exercise card displays an HD action thumbnail automatically resolved by its name.
- **Dedicated Edit Mode**: Simple one-touch edit/delete icons toggle with a single button to keep the screen clean.
- **Protected Defaults**: Built-in categories are protected from accidental full-category deletion while still allowing per-exercise customizations.
- **Custom Category Builder**: Create entire custom muscle groups (e.g., "Full Body", "HIIT") with custom emojis and exercises.
- **Today's Workout Schedule**: Daily exercise checklist with interactive checkmarks, progress bars, and completion badges.
- **Custom Workout Plans**: Multi-exercise plan creator, daily schedule mapper, progress trackers, and one-tap progress reset.
- **Workout History**: Historical logs capturing date, time, duration, and exercise volume.

### 2. 🥗 Nutrition & Calorie Tracking
- **Daily Target vs. Consumption**: Live circular and linear progress gauges for calorie intake.
- **Macronutrient Breakdown**: Tracks Protein, Carbohydrates, and Fats with visual progress indicators.
- **Meal Classification**: Categorize food by Breakfast, Lunch, Dinner, and Snacks.
- **Curated HD Food Thumbnails**: High-resolution imagery for popular food items (Rice, Chicken, Salmon, Avocado, Salad, Eggs, etc.).
- **Quick-Add Presets & Custom Foods**: Enter grams, calories, and macros effortlessly.

### 3. 💧 Water & Hydration Logger
- **Visual Hydration Progress**: Animated water intake percentage against daily target (e.g., 2500 ml).
- **Quick-Add Water Buttons**: Log common drink sizes with a single tap (+250ml cup, +500ml bottle, +750ml, +1000ml).
- **Hydration Streaks & Insights**: Keeps users mindful of healthy hydration habits throughout the day.

### 4. ⚖️ Real-Time BMI Calculator
- **Instant Body Mass Index (BMI)**: Dynamic calculation from user profile height (cm) and weight (kg).
- **Color-Coded Status Gauge**:
  - 🔵 Underweight (< 18.5)
  - 🟢 Normal (18.5 – 24.9)
  - 🟡 Overweight (25.0 – 29.9)
  - 🔴 Obese (30.0+)
- **Customized Health Guidance**: Fitness and nutrition advice based on fitness goals (Lose Weight, Maintain Weight, Gain Muscle).

### 5. 📊 Interactive Progress & Analytics
- **Visual Charts**: Powered by `react-native-chart-kit` for weight trajectory, calorie adherence, workout consistency, and water intake.
- **Timeframes**: Filter analytics by week, month, or all-time trends.
- **Milestone Badges**: Visual rewards for hitting streak goals and crushing workouts.

### 6. 🌓 Dual Themes (Light & Dark)
- **Energy Blue & Orange (Light Theme)**: High-contrast, clean daylight UI with subtle shadows.
- **OLED Modern Dark Theme**: Deep midnight palette (`#0F1419`, `#1A1F2E`) with glowing neon accents.
- **Instant Toggle**: Persistent theme switching preserved in storage.

### 7. 🔒 Multi-User Cloud Sync & Data Isolation
- **JWT Authentication**: Secure registration and login with bcrypt-hashed passwords.
- **Scoped User Data**: User A's custom exercises, edits, and deletions are saved under their own `userId` in MongoDB and are completely invisible to User B.
- **Cloudinary Avatar Upload**: Profile picture upload with cloud storage and auto-crop optimization.

---

## 🏗 System Architecture

```
                       ┌─────────────────────────────────────┐
                       │           FitTrack Mobile           │
                       │     (React Native / Expo App)       │
                       └──────────────────┬──────────────────┘
                                          │
                        RESTful HTTP API / JSON (Axios)
                               (Bearer JWT Auth)
                                          │
                                          ▼
                       ┌─────────────────────────────────────┐
                       │          Express.js Backend         │
                       │    (Node.js REST API Server)        │
                       └──────┬───────────────────────┬──────┘
                              │                       │
                 Mongoose ORM │                       │ Cloudinary SDK
                              ▼                       ▼
                     ┌────────────────┐       ┌────────────────┐
                     │ MongoDB Cloud  │       │   Cloudinary   │
                     │  (Atlas DB)    │       │ (Avatar Media) │
                     └────────────────┘       └────────────────┘
```

---

## 🛠 Tech Stack

### Frontend (Mobile App)
| Technology | Description |
|---|---|
| **React Native (0.86)** | Cross-platform mobile framework |
| **Expo (SDK 57)** | Managed runtime, tooling, and build platform |
| **React Navigation 7** | Stack Navigation, Bottom Tabs, and Center Action Buttons |
| **Expo Linear Gradient** | Multi-stop gradients for cards and hero banners |
| **Expo Image Picker** | Native camera/gallery picker for avatars |
| **AsyncStorage** | Local scoped persistence for fast offline-first caching |
| **react-native-chart-kit** | Interactive progress charts and trend graphs |
| **Axios** | HTTP client with automatic JWT token interceptors |

### Backend (Server & Database)
| Technology | Description |
|---|---|
| **Node.js** | Server-side JavaScript runtime |
| **Express.js (5.x)** | REST API routing and middleware framework |
| **MongoDB & Mongoose (9.x)** | NoSQL document database and schema modeling |
| **JSON Web Tokens (JWT)** | Stateless authentication and request authorization |
| **bcryptjs** | Salted password hashing |
| **Multer & Cloudinary** | Multipart/form-data image uploads with Cloudinary storage |

---

## 📂 Project Directory Structure

```text
FitTrack/
├── .gitignore
├── README.md
│
├── backend/
│   ├── config/
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   └── upload.js             # Multer + Cloudinary avatar uploader
│   ├── models/
│   │   ├── Food.js               # Food & Calorie schema
│   │   ├── Progress.js           # Weight & Progress metrics schema
│   │   ├── User.js               # User accounts & profile schema
│   │   ├── Water.js              # Hydration logging schema
│   │   ├── Workout.js            # Completed workout sessions schema
│   │   └── WorkoutLibrary.js     # Per-user custom categories & library edits
│   ├── routes/
│   │   ├── auth.js               # Login, register, profile, avatar routes
│   │   ├── foods.js              # Calorie & meal tracking endpoints
│   │   ├── library.js            # Per-user workout library sync & load
│   │   ├── progress.js           # Progress & weight endpoints
│   │   ├── water.js              # Water hydration endpoints
│   │   └── workouts.js           # Workout logging endpoints
│   ├── package.json
│   └── server.js                 # Express server entry point
│
└── frontend/
    ├── assets/                   # App icons, splash screens, badges
    ├── components/
    │   ├── CategoryImageCard.js  # HD image category card component
    │   ├── CenterFAB.js          # Animated central action button
    │   ├── FitAlert.js           # Custom branded themed modal alert system
    │   ├── HeroCard.js           # Motivational hero banner
    │   └── StatCard.js           # Quick metric display card
    ├── context/
    │   ├── AuthContext.js        # Global user authentication state
    │   └── ThemeContext.js       # Light / Dark theme state & persistence
    ├── navigation/
    │   ├── AuthNavigator.js      # Login & Register stack
    │   └── BottomTabs.js         # Main bottom navigation bar
    ├── screens/
    │   ├── SplashScreen.js       # Animated launch screen
    │   ├── auth/
    │   │   ├── LoginScreen.js    # User sign-in
    │   │   └── RegisterScreen.js # User sign-up & goal selection
    │   └── main/
    │       ├── HomeScreen.js     # Daily overview dashboard
    │       ├── WorkoutScreen.js  # HD workout library, plans & tracker
    │       ├── WorkoutHistoryScreen.js # Historical session logs
    │       ├── CaloriesScreen.js # Meal & macro counter
    │       ├── WaterScreen.js    # Hydration tracker
    │       ├── BMIScreen.js      # Interactive BMI calculator
    │       ├── ProgressScreen.js # Charts & visual analytics
    │       ├── ProfileScreen.js  # User profile & avatar management
    │       └── SettingsScreen.js # Theme, notifications & app settings
    ├── services/
    │   └── api.js                # Axios instance & token interceptors
    ├── utils/
    │   ├── exerciseImages.js     # Curated HD Unsplash images & smart matcher
    │   ├── theme.js              # Color system, typography, image catalogue
    │   ├── userStorage.js        # User-scoped AsyncStorage wrapper
    │   ├── workoutData.js        # Default workout library dataset
    │   └── workoutStorage.js     # Workout persistence & cloud sync logic
    ├── App.js                    # Root React Native component
    ├── app.json                  # Expo project configuration
    └── package.json
```

---

## 📡 API Reference

All protected endpoints require `Authorization: Bearer <token>`.

### Authentication & Profile (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Authenticate user and obtain JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user's profile |
| `PUT` | `/api/auth/profile` | Update age, height, weight, fitness goal |
| `POST` | `/api/auth/upload-avatar` | Upload profile photo to Cloudinary |
| `DELETE` | `/api/auth/avatar` | Remove user profile photo |

### Workout Library & Sessions (`/api/library` & `/api/workouts`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/library` | Get authenticated user's custom categories & edits |
| `POST` | `/api/library/sync` | Sync user's complete library customization state |
| `GET` | `/api/workouts` | Retrieve user's logged workout sessions |
| `POST` | `/api/workouts` | Log a completed exercise/workout session |

### Nutrition & Meals (`/api/foods`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/foods` | Get user's logged meals for the day |
| `POST` | `/api/foods` | Log a food entry with calories and macros |
| `DELETE` | `/api/foods/:id` | Delete a food entry |

### Hydration (`/api/water`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/water` | Get today's logged water intake |
| `POST` | `/api/water` | Add water intake (ml) |
| `DELETE` | `/api/water/reset` | Reset daily water counter |

### Progress & Weight (`/api/progress`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/progress` | Fetch historical weight and BMI logs |
| `POST` | `/api/progress` | Record a new weight entry |

---

## 💻 Getting Started & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go App](https://expo.dev/go) installed on your iOS or Android device
- [MongoDB URI](https://www.mongodb.com/cloud/atlas) (local or MongoDB Atlas connection string)
- (Optional) [Cloudinary](https://cloudinary.com/) credentials for avatar upload

---

### 1. Backend Setup

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fittrack?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   # Or: node server.js
   ```
   The backend will start on `http://localhost:5000` (or `http://YOUR_LOCAL_IP:5000`).

---

### 2. Frontend Setup

1. In a new terminal window, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install mobile dependencies:
   ```bash
   npm install
   ```

3. Configure your API base URL:
   Open `frontend/services/api.js` and set the `API_URL` to your computer's local Wi-Fi IP address (so your physical phone can reach it):
   ```javascript
   // Replace with your computer's local IP address (e.g., 192.168.1.5)
   const API_URL = 'http://<YOUR_LOCAL_IP>:5000/api';
   ```

4. Start the Expo development server:
   ```bash
   npx expo start
   ```

5. Run on your device:
   - **Physical Device**: Scan the QR code in the terminal using the **Expo Go** app (Android) or the **Camera** app (iOS).
   - **Android Emulator**: Press `a` in the terminal.
   - **iOS Simulator**: Press `i` in the terminal.
   - **Web Browser**: Press `w` in the terminal.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
|---|---|---|
| `PORT` | Port for Express server | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/fittrack` |
| `JWT_SECRET` | Secret key for signing JWTs | `fittrack_jwt_secret_2026` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `abcdefghijklmnopqrstuv` |

---

## 🎨 Design System & Visual Aesthetics

FitTrack utilizes a bespoke design system (`frontend/utils/theme.js`):
- **Curated HD Imagery**: Unsplash photography specifically chosen for every muscle group, exercise movement, meal category, and hydration stage.
- **Haptic-like Feedback**: Glowing active states, colored left border highlights, and interactive completion checkmarks.
- **Micro-Badges**: Set & Rep chips (`⚡ Sets`, `🔄 Reps`), Custom tags (`★ CUSTOM`), and status indicators.
- **Glassmorphism & Gradients**: Layered frosted cards over rich background imagery for maximum visual depth.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it for personal and commercial projects.

---

<p align="center">
  Built with ❤️ for Fitness Enthusiasts Everywhere.
</p>
