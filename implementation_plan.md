# Implementation Plan - Inventory Management System (PWA)

Dikarenakan Flutter SDK tidak tersedia, aplikasi ini akan dibangun sebagai **Progressive Web App (PWA)** menggunakan **React & Vite**. Aplikasi ini akan memiliki tampilan dan rasa (look-and-feel) seperti aplikasi mobile native (Android).

## 1. Tech Stack
- **Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Mobile-First Design, Dark Mode default)
- **Icons:** Lucide React
- **QR Operations:** 
  - Scan: `html5-qrcode` atau `react-qr-reader`
  - Generate: `qrcode.react`
- **Backend:** Google Firebase (Auth, Firestore)
  - *Note: Memerlukan konfigurasi Firebase Config dari User untuk fitur live.*

## 2. Architecture & Navigation

### Routes
- `/` -> Login Page (Role selection included for demo/dev, or auto-detect from Auth)
- `/dashboard` -> Main Dashboard
  - **Admin View:** Stats Summary, List Items, FAB to Add Item.
  - **User View:** Quick Scan Button, Active Items List (My Items).
- `/scan` -> QR Scanner Page (Full screen camera)
- `/item/:id` -> Item Detail Page
  - **Admin:** Edit, Delete, Print QR, View History.
  - **User:** Check-in / Report Condition (Baik/Rusak).
- `/history` -> Log Activity List

## 3. Key Components (Mobile UI)
- **AppShell:** Layout utama dengan Navigation Bar di bawah (Bottom Nav) untuk User, dan Sidebar/Bottom Nav untuk Admin.
- **QRScanner:** Komponen kamera overlay.
- **ItemCard:** Card visual untuk barang dengan status (Available/In Use).
- **StatusBadge:** Indikator visual kondisi barang.

## 4. Development Phases

### Phase 1: Setup & UI Foundation
- Initialize Vite Project.
- Setup Tailwind CSS with custom "App" theme.
- Create Mock Data (based on `items.md` and `logs.md`) for offline development.

### Phase 2: Core Features
- Implement Login UI.
- Implement Dashboard (Admin & User layouts).
- Implement Item Management (Create, List, Details).

### Phase 3: QR Integration
- integrate `qrcode.react` for generating codes.
- integrate Scanner library for reading codes.

### Phase 4: Firebase Integration (If Creds Provided)
- Connect Auth and Firestore.
- Replace Mock Data with Real Data.

## 5. Next Steps
1. Approve this plan.
2. Run `npx create-vite@latest .`
3. Install dependencies.
