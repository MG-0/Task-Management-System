<div align="center">
  <img src="frontend/public/favicon.svg" alt="TaskFlow Logo" width="120" />
  <h1>✨ TaskFlow - Task Management System</h1>
  <p>A modern, lightning-fast full-stack task management application designed for productivity.</p>
</div>

---

TaskFlow is a premium task management web application built for speed and an excellent user experience. It features real-time optimistic UI updates, custom category workspaces, task assignments, and priority management.

## 🚀 Tech Stack

### 💻 Frontend
- ⚛️ **React 19** with **TypeScript**
- ⚡ **Vite** for fast, modern build tooling
- 🎨 **Tailwind CSS** for responsive styling
- 🖼️ **Lucide React** for beautiful, consistent icons
- 📡 **Axios** for API requests
- 🗺️ **React Router DOM** for navigation
- 🧠 **Context API** for Authentication state management (Lightweight, no external state libraries needed)

### ⚙️ Backend
- 🐘 **PHP 8.5** 
- 🚀 **Laravel 13** (RESTful API)
- 🗄️ **PostgreSQL** (Neon Serverless Database)
- 🛡️ **Laravel Sanctum** for secure API authentication
- 🧩 **Eloquent ORM** for database interactions

## ✨ Key Features
- ⚡ **Optimistic UI:** State changes (like task completion or deletion) update the UI instantly without waiting for network responses, resulting in a buttery smooth experience.
- 🌙 **Modern Dark Theme:** A premium dark UI featuring pure black backgrounds (`#080808`) with Emerald Green accents, inspired by tools like Linear and Vercel.
- 📁 **Workspaces (Categories):** Group your tasks logically using custom-colored categories.
- 📝 **Task Management:** Set priorities (Low/Medium/High), due dates, status, and assign tasks to different users.
- 🏎️ **Performance Tuned:** PDO persistent connections config integrated to significantly reduce database cold-start latency.

## 🛠️ Setup & Installation

### 📋 Prerequisites
- **Node.js & npm** (for the frontend)
- **PHP 8.5+ & Composer** (for the backend)
- **PostgreSQL database**

### 1️⃣ Clone the repository
```bash
git clone https://github.com/MG-0/Task-Management-System.git
cd Task-Management-System
```

### 2️⃣ Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Update .env with your PostgreSQL credentials
php artisan migrate
php artisan serve
```

### 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
# Update frontend/src/services/api.ts with your backend URL if different
npm run dev
```

## 🎨 Design Philosophy
The application prioritizes a distraction-free, professional environment. By utilizing native inline styles for dynamic properties alongside Tailwind, the app guarantees consistent rendering, high contrast, and zero caching issues.

<br />
<div align="center">
  <i>Built with ❤️ for better task management</i>
</div>
