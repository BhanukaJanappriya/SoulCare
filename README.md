
---

# 🧠 SoulCare – Online Stress and Depression Detection System

**SoulCare** is an intelligent web application that helps users detect and manage stress and depression through digital self-assessments, AI-driven analytics, and access to professional mental health support. Designed for **patients**, **doctors**, **counselors**, and **admins**, SoulCare blends psychological science with scalable technology to improve mental well-being.

🔗 **Project URL**: [https://github.com/BhanukaJanappriya/SoulCare](https://github.com/BhanukaJanappriya/SoulCare)

---

## ✨ Table of Contents
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [Tech Stack](#️-tech-stack)
- [How It Works](#-how-it-works)
- [Getting Started: Setup Guide](#-getting-started-setup-guide)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1--backend-setup)
  - [Frontend Setup](#2--frontend-setup)
- [Running the Application](#-running-the-application)
- [Project Modules](#-project-modules)

---

## ✨ Key Features

- 🔐 **Secure Login & Role-Based Access**  
  Patients, doctors, counselors, and admins get unique, secure access based on their role.

- 🧠 **Stress & Depression Detection**  
  Interactive assessments (e.g., word associations, reaction tests, color therapy) to analyze mental health.

- 📈 **Personalized Progress Reports**  
  Users can track their emotional trends and receive data-driven feedback.

- 📅 **Appointment Management**  
  Patients can book video sessions; doctors and counselors can accept/reschedule appointments.

- 💬 **Real-Time Chat**
  Secure, real-time messaging between patients and providers powered by WebSockets.

- 💊 **Medical Records & Journals**  
  Secure access to reports, daily journal entries, and treatment suggestions.

- 📣 **Community Support Forum**  
  Safe space for anonymous discussions, moderated by professionals.

- 🔒 **Privacy by Design**  
  End-to-end encryption, anonymized data handling, and compliance with health privacy standards.

---

## 🧑‍💻 User Roles

| Role        | Capabilities |
|-------------|-------------|
| **Patient** | Self-assessments, appointments, journals, reports, real-time chat, forum access |
| **Doctor**  | View patient data, schedule sessions, prescribe, communicate securely via chat |
| **Counselor** | Provide therapy, monitor progress, join discussions, communicate via chat |
| **Admin**   | Manage users, moderate content, verify doctors/counselors |

---

## ⚙️ Tech Stack

| Layer        | Technology |
|--------------|------------|
| **Backend**  | **Django (Python)**, Django REST Framework, **Django Channels** |
| **Frontend** | **React.js**, TypeScript, Tailwind CSS |
| **Database** | **MySQL** |
| **Real-time**| **WebSockets** (Chat), WebRTC (Video) |
| **Messaging/Cache** | **Redis** |
| **Containerization** | Docker (supported) |

---

## 🚀 How It Works

1. Users register and complete self-assessments.
2. Results are analyzed and stored securely.
3. Based on trends, users can book appointments, journal their progress, or chat with providers.
4. Doctors and counselors provide feedback, reports, or interventions through the platform.
5. The forum and real-time features enhance long-term engagement and support.

---

## 📦 Getting Started: Setup Guide

Follow these steps to set up and run the project locally.

### Prerequisites

Make sure you have the following software installed on your system:
- **Python** (3.10+)
- **Node.js** and **npm** (v18+)
- **MySQL Server** (e.g., from XAMPP, WAMP, or a standalone installation)
- **Redis**
- **Git**

### 1. Backend Setup

This will prepare the Django server, database, and real-time messaging service.

#### Step 1: Clone the Repository
```bash
git clone https://github.com/BhanukaJanappriya/SoulCare.git
cd SoulCare/soulcare_backend
```

#### Step 2: Create a Virtual Environment & Install Dependencies
It's highly recommended to use a virtual environment.

```bash
# Create a virtual environment
python -m venv venv

# Activate it
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install all required packages
pip install -r requirements.txt
```

The `requirements.txt` file includes:
```
# Core Django Dependencies
asgiref==3.10.0
Django==5.2.7
django-cors-headers==4.9.0
djangorestframework==3.16.1
djangorestframework_simplejwt==5.5.1
pillow==12.0.0
PyJWT==2.10.1
PyMySQL==1.1.1
sqlparse==0.5.3
tzdata==2025.2

# New Chat & ASGI Dependencies
channels==4.0.0
channels_redis==4.2.0
daphne==4.1.2
cryptography==43.0.0
```

#### Step 3: Set Up the Database
1. Make sure your **MySQL server is running**.
2. Create a new database in MySQL named `soulcare_db`.
3. Configure your database connection in `soulcare_backend/settings.py`.

#### Step 4: Install and Run Redis
The chat system requires a running Redis server.

* **On Windows:**
    1.  Download the `.msi` installer from the [official Microsoft archive on GitHub](https://github.com/microsoftarchive/redis/releases).
    2.  Run the installer with default settings. It will automatically run as a background service.
* **On macOS (using Homebrew):**
    1.  `brew install redis`
    2.  `brew services start redis`

#### Step 5: Run Database Migrations
This command creates the necessary tables in your `soulcare_db` database.
```bash
python manage.py migrate
```

### 2. Frontend Setup

This will prepare the React client application.

1. Navigate to the frontend directory:
   ```bash
   cd ../soulcare_frontend
   ```
2. Install the necessary Node.js packages:
   ```bash
   npm install
   ```

---

## 🏃 Running the Application

To run the full application, you need **four services running simultaneously**: MySQL, Redis, the Backend Server, and the Frontend Server.

1.  **Ensure MySQL is running** (from XAMPP, etc.).
2.  **Ensure Redis is running** (as a background service).
3.  **Run the Backend Server** (from the `soulcare_backend` directory):
    
    **Important**: Use the `daphne` command now to support both HTTP and WebSockets for chat.
    ```bash
    daphne -p 8000 soulcare_backend.asgi:application
    ```
4.  **Run the Frontend Server** (from the `soulcare_frontend` directory in a **new terminal**):
    ```bash
    npm run dev
    ```

You can now access the application at `http://localhost:5173`.

---

## 📌 Project Modules

- User authentication & verification
- Real-time chat with WebSockets
- Assessment tools with adaptive logic
- Result visualization (charts, trends)
- Appointment booking and video consultation
- Blog and forum systems
- Role-based dashboards for all users
- Admin moderation panel
- Content and account management tools
