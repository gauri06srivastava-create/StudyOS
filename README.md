
# StudyOS 📚

### Your Smart Study Space

StudyOS is an AI-powered study platform designed to help students learn smarter, organize study materials, and track their academic progress.

## ✨ Features

- **Dashboard:** View study statistics, recent activity, and saved study plans.
- **My Documents:** Upload and manage PDF study materials.
- **Smart Notes:** Generate AI-powered notes from uploaded PDFs and download them.
- **AI Tutor:** Ask questions based on uploaded study material.
- **Quiz & Practice:** Generate MCQ quizzes and get instant feedback with explanations.
- **My Progress:** Track quiz scores, performance, and weak topics.
- **Smart Revision:** Identify weak topics and manage revision tasks.
- **Study Timer:** Use a Pomodoro timer to improve focus.
- **AI Study Plan:** Generate and save personalized study plans.

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- React Router

### Backend
- Python
- FastAPI
- PyMuPDF
- Groq API

## 📁 Project Structure

```text
StudyOS/
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   └── App.css
├── backend/
│   ├── main.py
│   └── uploads/
├── public/
├── package.json
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/gauri06srivastava-create/StudyOS.git
cd StudyOS
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

### 4. Set up the backend

Open a second terminal:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install fastapi uvicorn python-multipart pymupdf groq python-dotenv
```

### 5. Configure environment variables

Create a `.env` file inside the backend folder:

```env
GROQ_API_KEY=your_groq_api_key
```

Never upload your API key to GitHub.

### 6. Start the backend

```bash
uvicorn main:app --reload
```

Backend runs at:

https://studyos-08bx.onrender.com

## 🎯 Project Goal

StudyOS aims to provide students with a single platform for managing study materials, generating notes, practicing questions, tracking performance, and planning revisions.

## 👩‍💻 Developed By

**Gauri Srivastava**

GitHub: https://github.com/gauri06srivastava-create

---

⭐ If you find StudyOS useful, consider giving this repository a star!
 

## 🏗️ System Architecture

```mermaid
flowchart TB
    U["Student"] --> FE

    subgraph FRONTEND["Frontend - React + Vite"]
        FE["StudyOS Interface"]
        FE --> DB["Dashboard"]
        FE --> DOC["Document Library"]
        FE --> TUTOR["AI Tutor"]
        FE --> QUIZ["Quiz & Practice"]
        FE --> PROG["Progress Tracking"]
        FE --> REV["Smart Revision"]
        FE --> TIMER["Study Timer"]
        FE --> PLAN["AI Study Plan"]
    end

    subgraph BACKEND["Backend - Python + FastAPI"]
        API["REST API"]
        UP["PDF Upload API"]
        NOTES["Notes Generation API"]
        ASK["Ask PDF API"]
        QGEN["Quiz Generation API"]
        SGEN["Study Plan API"]
    end

    FE --> API
    API --> UP
    API --> NOTES
    API --> ASK
    API --> QGEN
    API --> SGEN

    subgraph AI["AI & Document Processing"]
        PDF["PyMuPDF - Text Extraction"]
        GROQ["Groq API - LLM Processing"]
    end

    UP --> PDF
    PDF --> NOTES
    PDF --> ASK
    NOTES --> GROQ
    ASK --> GROQ
    QGEN --> GROQ
    SGEN --> GROQ

    subgraph STORAGE["Browser Storage"]
        LS["LocalStorage"]
        HISTORY["Quiz History"]
        STUDY["Study Data"]
        SAVED["Saved Study Plans"]
    end

    FE <--> LS
    LS --> HISTORY
    LS --> STUDY
    LS --> SAVED
```