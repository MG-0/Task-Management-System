# TaskFlow - Task Management System

TaskFlow is a modern, full-stack task management web application designed for performance and excellent user experience. It features real-time optimistic UI updates, categories/workspaces, task assignments, and priority management. 

![TaskFlow UI Dashboard](frontend/public/favicon.ico) *(Replace with actual screenshot later)*

## 🚀 Tech Stack

### Frontend
- **React 19** with **TypeScript**
- **Vite** for fast, modern build tooling
- **Tailwind CSS** for responsive styling
- **Lucide React** for beautiful, consistent icons
- **Axios** for API requests
- **React Router DOM** for navigation
- **Context API** for Authentication state management (No external state libraries like Zustand used to keep it lightweight)

### Backend
- **Laravel 11** (RESTful API)
- **PostgreSQL** (Neon Serverless Database)
- **Laravel Sanctum** for secure API authentication
- **Eloquent ORM** for database interactions

## ✨ Key Features
- **Optimistic UI:** State changes (like task completion or deletion) update the UI instantly without waiting for network responses, resulting in a buttery smooth experience.
- **Modern Dark Theme:** A premium dark UI featuring pure black backgrounds (`#080808`) with Emerald Green accents, inspired by tools like Linear and Vercel.
- **Workspaces (Categories):** Group your tasks logically using custom-colored categories.
- **Task Management:** Set priorities (Low/Medium/High), due dates, status, and assign tasks to different users.
- **Performance Tuned:** PDO persistent connections config integrated to significantly reduce database cold-start latency.

## 🛠️ Setup & Installation

### Prerequisites
- Node.js & npm (for the frontend)
- PHP 8.2+ & Composer (for the backend)
- PostgreSQL database

### 1. Clone the repository
```bash
git clone git@github.com:MG-0/Task-Management-System.git
cd Task-Management-System
```

### 2. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Update .env with your PostgreSQL credentials
php artisan migrate
php artisan serve
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
# Update frontend/src/services/api.ts with your backend URL if different
npm run dev
```

## 🎨 Design Philosophy
The application prioritizes a distraction-free, professional environment. By utilizing native inline styles for dynamic properties alongside Tailwind, the app guarantees consistent rendering and high contrast.
