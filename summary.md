# Project Anti Gravity - Inventory Management System

## 1. Project Overview
Aplikasi Android berbasis **Flutter** untuk manajemen perbendaharaan barang (aset) internal. Aplikasi ini memfasilitasi pelacakan aset menggunakan teknologi **QR Code**. Admin dapat mendata barang, sementara User (pegawai) melaporkan penggunaan/kondisi barang melalui scan QR.

**Tujuan Utama:** Mengetahui posisi aset, pemegang terakhir, dan kondisi aset secara *real-time*.

---

## 2. Tech Stack

### Frontend (Mobile App)
* **Framework:** Flutter (Dart)
* **Target Platform:** Android
* **State Management:** Provider / Riverpod (Recommended)
* **Key Libraries:**
    * `qr_flutter`: Untuk generate QR Code (Admin).
    * `mobile_scanner`: Untuk scan QR Code (User).
    * `firebase_core`, `firebase_auth`, `cloud_firestore`.

### Backend (Serverless)
* **Platform:** Google Firebase
* **Database:** Cloud Firestore (NoSQL)
* **Authentication:** Firebase Auth (Email & Password)
* **Storage (Optional):** Firebase Storage (Untuk foto barang jika diperlukan)

---

## 3. User Roles & Features

### A. Role: Admin
1.  **Manage Items (CRUD):** Tambah, edit, hapus data barang.
2.  **Generate QR:** Membuat kode QR unik berdasarkan ID Barang untuk dicetak.
3.  **Manage Users:** Mendaftarkan akun untuk pegawai (User).
4.  **Real-time Dashboard:** Melihat status seluruh barang (Siapa yang pegang, Kondisi, Kapan terakhir update).

### B. Role: User (Pegawai)
1.  **Scan QR:** Menggunakan kamera HP untuk memindai QR pada fisik barang.
2.  **Report/Check-in:** Melaporkan bahwa barang sedang digunakan olehnya dan update kondisi fisik (Baik/Rusak).
3.  **My Items:** (Opsional) Melihat daftar barang yang sedang dipegang saat ini.

---

## 4. Database Schema (Firestore)

### Collection: `users`
Menyimpan data profil pengguna.
```json
{
  "uid": "string (Auth UID)",
  "name": "string (Nama Lengkap)",
  "email": "string",
  "role": "admin | user",
  "department": "string"
}