# 🧠 SoulCare – Online Stress and Depression Detection System

**SoulCare** is an intelligent web application that helps users detect and manage stress and depression through digital self-assessments, AI-driven analytics, and access to professional mental health support.

**New in v2.0:** SoulCare now features a **Local AI Companion**. Powered by a lightweight Llama 3.2 model running locally on your machine via Ollama, the assistant provides private, secure, and empathetic support with real-time voice interaction and safety overrides for crisis situations.

🔗 **Project URL**: [https://github.com/BhanukaJanappriya/SoulCare](https://github.com/BhanukaJanappriya/SoulCare)

---

## ✨ Table of Contents
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [Tech Stack](#️-tech-stack)
- [How It Works](#-how-it-works)
- [Getting Started: Setup Guide](#-getting-started-setup-guide)
  - [Prerequisites](#prerequisites)
  - [1. Local AI Setup (Ollama)](#1--local-ai-setup-ollama)
  - [2. Backend Setup](#2--backend-setup)
  - [3. Frontend Setup](#3--frontend-setup)
- [Running the Application](#-running-the-application)
- [Project Modules](#-project-modules)

---

## ✨ Key Features

- 🔐 **Secure Login & Role-Based Access** Patients, doctors, counselors, and admins get unique, secure access based on their role.

- 🤖 **SoulCare AI Assistant (New!)** A private, local AI chatbot that offers:
    - **Empathetic Conversation:** Powered by Llama 3.2.
    - **Crisis Safety System:** NLTK-based keyword detection immediately overrides the AI to provide emergency hotline numbers during crisis inputs.
    - **Interactive Tools:** Integrated breathing exercises and mood tracking shortcuts.
    - **Accessibility:** Text-to-speech (Voice) and customizable UI themes/font sizes.

- 🧠 **Stress & Depression Detection** Interactive assessments (e.g., word associations, reaction tests, color therapy) to analyze mental health.

- 📈 **Personalized Progress Reports** Users can track their emotional trends and receive data-driven feedback.

- 📅 **Appointment Management** Patients can book video sessions; doctors and counselors can accept/reschedule appointments.

- 💬 **Real-Time Chat** Secure, real-time messaging between patients and providers powered by WebSockets.

- 💊 **Medical Records & Journals** Secure access to reports, daily journal entries, and treatment suggestions.

- 📣 **Community Support Forum** Safe space for anonymous discussions, moderated by professionals.

- 🔒 **Privacy by Design** End-to-end encryption, anonymized data handling, and **100% local AI processing** (your chat data never leaves your computer).

---

## 🧑‍💻 User Roles

| Role        | Capabilities |
|-------------|-------------|
| **Patient** | AI Chatbot access, Self-assessments, appointments, journals, reports, forum access |
| **Doctor** | View patient data, schedule sessions, prescribe, communicate securely via chat |
| **Counselor** | Provide therapy, monitor progress, join discussions, communicate via chat |
| **Admin** | Manage users, moderate content, verify doctors/counselors |

---

## ⚙️ Tech Stack

The system utilizes a modern, hybrid architecture to handle real-time communication and local AI processing efficiently.

| Layer        | Technology |
|--------------|------------|
| **Backend** | **Django (Python)**, Django REST Framework, **Django Channels** |
| **AI & NLP** | **Ollama** (Local LLM Host), **Llama 3.2** (Model), **NLTK** (Safety Logic) |
| **Frontend** | **React.js**, TypeScript, Tailwind CSS, Web Speech API |
| **Database** | **MySQL** |
| **Real-time**| **WebSockets** (Chat), WebRTC (Video) |
| **Messaging**| **Redis** |

---

## 🚀 How It Works

1. **Local Intelligence:** The backend connects to a local Ollama instance to generate AI responses without external API calls, ensuring privacy and zero latency issues.
2. **Safety First:** Before the AI generates a response, the user's input passes through an NLTK-based safety filter. If self-harm keywords are detected, the system intercepts the request and provides emergency resources.
3. **User Journey:** Users register, complete assessments, and use the AI assistant for daily support. Based on results, they can book appointments with real doctors/counselors via the platform.

---

## 📦 Getting Started: Setup Guide

Follow these steps to set up and run the project locally.

### Prerequisites

Make sure you have the following software installed on your system:
- **Python** (3.10+)
- **Node.js** and **npm** (v18+)
- **MySQL Server** (e.g., from XAMPP, WAMP)
- **Redis**
- **Ollama** (For the AI Chatbot)
- **Git**

---

### 1. 🦙 Local AI Setup (Ollama)

This is required for the Chatbot to function.

1.  Download and install **Ollama** from [ollama.com](https://ollama.com).
2.  Open your terminal and run the following command to download the lightweight model (this fits in standard laptop memory):
    ```bash
    ollama run llama3.2:1b
    ```
3.  Wait for the download to finish. Once you see the chat prompt, type `/bye` to exit.
4.  Ensure the Ollama app is running in your background/taskbar.

---

### 2. 🐍 Backend Setup

#### Step 1: Clone the Repository
```bash
git clone [https://github.com/BhanukaJanappriya/SoulCare.git](https://github.com/BhanukaJanappriya/SoulCare.git)
cd SoulCare/soulcare_backend
```

#### Step 2: Create Environment & Install Dependencies
##### Create and activate virtual environment
```bash
python -m venv .venv
source .venv/bin/activate  # (Use .venv\Scripts\activate on Windows)
```
##### Install dependencies
```bash
pip install -r requirements.txt
```
#### Step 3: Configure Environment Variables
##### Database Config
```bash
DB_NAME=soulcare_db
DB_USER=root
DB_PASSWORD=your_password
```
##### AI Config (Points to your local Ollama)
```bash
OPENAI_API_KEY="ollama"
OPENAI_BASE_URL="http://localhost:11434/v1" Database Config
DB_NAME=soulcare_db
DB_USER=root
DB_PASSWORD=your_password
```

#### Step 4: Database & Redis
###### 1.Ensure MySQL is running and create a database named soulcare_db.

##### 2.Ensure Redis is running.

##### 3.Run migrations:
```bash
python manage.py migrate
```
---

# ⚛️ Frontend Setup
## Navigate to the frontend directory:
### Install dependencies:

```bash
npm install
```

### 🏃 Running the Application
- To run the full application, you need Ollama plus the three services running simultaneously.
- Start Ollama: Ensure the Ollama icon is visible in your system tray.
- Start Redis: Ensure the Redis service is active.

### Run Backend:

```bash
cd soulcare_backend
daphne -p 8000 soulcare_backend.asgi:application
```
Run Frontend:

```bash
cd soulcare_frontend
npm run dev
You can now access SoulCare at http://localhost:5173.
```
---
## 📌 Project Modules
* AI Assistant: Local Llama 3.2 integration with voice and typing effects.

* User Auth: JWT-based secure login.

* Real-time Chat: WebSocket communication between patients and providers.

* Assessments: Logic-based mental health tests.

* Video Consultations: Integrated appointment system.

* Admin Panel: Content moderation and user management.
---
